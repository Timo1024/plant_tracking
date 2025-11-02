import os
import uuid
import qrcode
from datetime import datetime, date
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from sqlalchemy import create_engine, and_
from sqlalchemy.orm import sessionmaker
from models import Base, Plant, Pot, Soil, PlantPotHistory

app = Flask(__name__)
CORS(app)

# Database setup
DATABASE_URL = os.getenv(
    'DATABASE_URL', 'mysql+pymysql://tracker:trackerpass@localhost:3306/planttracker')
engine = create_engine(DATABASE_URL, echo=True)
Session = sessionmaker(bind=engine)

# Create tables
Base.metadata.create_all(engine)

# Helper function to generate QR code


def generate_qr_code(qr_code_id, domain='http://localhost:3000'):
    """Generate QR code for a pot"""
    url = f"{domain}/pot/{qr_code_id}"
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    # Save QR code
    qr_path = f"static/qrcodes/{qr_code_id}.png"
    img.save(qr_path)
    return qr_path


# ============== PLANT ROUTES ==============

@app.route('/api/plants', methods=['GET'])
def get_plants():
    """Get all plants"""
    session = Session()
    try:
        plants = session.query(Plant).all()
        result = []

        for plant in plants:
            plant_dict = plant.to_dict()

            # Get current pot info
            current_history = session.query(PlantPotHistory).filter(
                and_(PlantPotHistory.plant_id == plant.id,
                     PlantPotHistory.end_date.is_(None))
            ).first()

            if current_history:
                plant_dict['current_pot'] = current_history.pot.to_dict()
                plant_dict['current_soil'] = current_history.soil.to_dict()
            else:
                plant_dict['current_pot'] = None
                plant_dict['current_soil'] = None

            result.append(plant_dict)

        return jsonify(result), 200
    finally:
        session.close()


@app.route('/api/plants/<int:plant_id>', methods=['GET'])
def get_plant(plant_id):
    """Get plant details with current pot and full history"""
    session = Session()
    try:
        plant = session.query(Plant).filter(Plant.id == plant_id).first()
        if not plant:
            return jsonify({'error': 'Plant not found'}), 404

        plant_dict = plant.to_dict()

        # Get current pot
        current_history = session.query(PlantPotHistory).filter(
            and_(PlantPotHistory.plant_id == plant_id,
                 PlantPotHistory.end_date.is_(None))
        ).first()

        if current_history:
            plant_dict['current_pot'] = current_history.pot.to_dict()
            plant_dict['current_soil'] = current_history.soil.to_dict()
        else:
            plant_dict['current_pot'] = None
            plant_dict['current_soil'] = None

        # Get full history
        history = session.query(PlantPotHistory).filter(
            PlantPotHistory.plant_id == plant_id
        ).order_by(PlantPotHistory.start_date.desc()).all()

        plant_dict['history'] = [h.to_dict() for h in history]

        return jsonify(plant_dict), 200
    finally:
        session.close()


@app.route('/api/plants', methods=['POST'])
def add_plant():
    """Add a new plant"""
    session = Session()
    try:
        data = request.json

        # Parse date
        date_added = datetime.strptime(
            data.get('date_added', date.today().isoformat()), '%Y-%m-%d').date()

        plant = Plant(
            name=data['name'],
            family=data['family'],
            genus=data['genus'],
            species=data['species'],
            species2=data.get('species2'),
            variation=data.get('variation'),
            size=data['size'],
            status=data.get('status', 'active'),
            removed_reason=data.get('removed_reason'),
            date_added=date_added,
            notes=data.get('notes')
        )

        session.add(plant)
        session.commit()

        return jsonify(plant.to_dict()), 201
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        session.close()


@app.route('/api/plants/<int:plant_id>', methods=['PUT'])
def update_plant(plant_id):
    """Update plant details"""
    session = Session()
    try:
        plant = session.query(Plant).filter(Plant.id == plant_id).first()
        if not plant:
            return jsonify({'error': 'Plant not found'}), 404

        data = request.json

        # Update fields
        if 'name' in data:
            plant.name = data['name']
        if 'family' in data:
            plant.family = data['family']
        if 'genus' in data:
            plant.genus = data['genus']
        if 'species' in data:
            plant.species = data['species']
        if 'species2' in data:
            plant.species2 = data['species2']
        if 'variation' in data:
            plant.variation = data['variation']
        if 'size' in data:
            plant.size = data['size']
        if 'status' in data:
            plant.status = data['status']
        if 'removed_reason' in data:
            plant.removed_reason = data['removed_reason']
        if 'notes' in data:
            plant.notes = data['notes']

        session.commit()

        return jsonify(plant.to_dict()), 200
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        session.close()


@app.route('/api/plants/<int:plant_id>', methods=['DELETE'])
def remove_plant(plant_id):
    """Mark plant as removed"""
    session = Session()
    try:
        plant = session.query(Plant).filter(Plant.id == plant_id).first()
        if not plant:
            return jsonify({'error': 'Plant not found'}), 404

        data = request.json
        plant.status = 'removed'
        plant.removed_reason = data.get('removed_reason', 'Not specified')

        # Close current pot assignment
        current_history = session.query(PlantPotHistory).filter(
            and_(PlantPotHistory.plant_id == plant_id,
                 PlantPotHistory.end_date.is_(None))
        ).first()

        if current_history:
            current_history.end_date = date.today()

        session.commit()

        return jsonify(plant.to_dict()), 200
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        session.close()


# ============== POT ROUTES ==============

@app.route('/api/pots', methods=['GET'])
def get_pots():
    """Get all pots"""
    session = Session()
    try:
        pots = session.query(Pot).all()
        result = []

        for pot in pots:
            pot_dict = pot.to_dict()

            # Get current plant
            current_history = session.query(PlantPotHistory).filter(
                and_(PlantPotHistory.pot_id == pot.id,
                     PlantPotHistory.end_date.is_(None))
            ).first()

            if current_history:
                pot_dict['current_plant'] = current_history.plant.to_dict()
                pot_dict['current_soil'] = current_history.soil.to_dict()
            else:
                pot_dict['current_plant'] = None
                pot_dict['current_soil'] = None

            result.append(pot_dict)

        return jsonify(result), 200
    finally:
        session.close()


@app.route('/api/pots/<qr_code_id>', methods=['GET'])
def get_pot_by_qr(qr_code_id):
    """Get pot info by QR code ID"""
    session = Session()
    try:
        pot = session.query(Pot).filter(Pot.qr_code_id == qr_code_id).first()
        if not pot:
            return jsonify({'error': 'Pot not found'}), 404

        pot_dict = pot.to_dict()

        # Get current plant
        current_history = session.query(PlantPotHistory).filter(
            and_(PlantPotHistory.pot_id == pot.id,
                 PlantPotHistory.end_date.is_(None))
        ).first()

        if current_history:
            pot_dict['current_plant'] = current_history.plant.to_dict()
            pot_dict['current_soil'] = current_history.soil.to_dict()
            pot_dict['start_date'] = current_history.start_date.isoformat()
        else:
            pot_dict['current_plant'] = None
            pot_dict['current_soil'] = None
            pot_dict['start_date'] = None

        return jsonify(pot_dict), 200
    finally:
        session.close()


@app.route('/api/pots', methods=['POST'])
def add_pot():
    """Add a new pot with QR code generation"""
    session = Session()
    try:
        data = request.json

        # Generate unique QR code ID
        qr_code_id = str(uuid.uuid4())[:8]

        # Ensure uniqueness
        while session.query(Pot).filter(Pot.qr_code_id == qr_code_id).first():
            qr_code_id = str(uuid.uuid4())[:8]

        pot = Pot(
            qr_code_id=qr_code_id,
            room=data['room'],
            size=data['size'],
            notes=data.get('notes'),
            active=data.get('active', True)
        )

        session.add(pot)
        session.commit()

        # Generate QR code
        domain = data.get('domain', 'http://localhost:3000')
        qr_path = generate_qr_code(qr_code_id, domain)

        pot_dict = pot.to_dict()
        pot_dict['qr_code_path'] = qr_path

        return jsonify(pot_dict), 201
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        session.close()


@app.route('/api/pots/<int:pot_id>', methods=['PUT'])
def update_pot(pot_id):
    """Update pot info"""
    session = Session()
    try:
        pot = session.query(Pot).filter(Pot.id == pot_id).first()
        if not pot:
            return jsonify({'error': 'Pot not found'}), 404

        data = request.json

        if 'room' in data:
            pot.room = data['room']
        if 'size' in data:
            pot.size = data['size']
        if 'notes' in data:
            pot.notes = data['notes']
        if 'active' in data:
            pot.active = data['active']

        session.commit()

        return jsonify(pot.to_dict()), 200
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        session.close()


# ============== SOIL ROUTES ==============

@app.route('/api/soils', methods=['GET'])
def get_soils():
    """Get all soil mixes"""
    session = Session()
    try:
        soils = session.query(Soil).all()
        return jsonify([soil.to_dict() for soil in soils]), 200
    finally:
        session.close()


@app.route('/api/soils', methods=['POST'])
def add_soil():
    """Add a new soil mix"""
    session = Session()
    try:
        data = request.json

        soil = Soil(
            name=data['name'],
            composition=data['composition']
        )

        session.add(soil)
        session.commit()

        return jsonify(soil.to_dict()), 201
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        session.close()


@app.route('/api/soils/<int:soil_id>', methods=['PUT'])
def update_soil(soil_id):
    """Update soil mix"""
    session = Session()
    try:
        soil = session.query(Soil).filter(Soil.id == soil_id).first()
        if not soil:
            return jsonify({'error': 'Soil not found'}), 404

        data = request.json

        if 'name' in data:
            soil.name = data['name']
        if 'composition' in data:
            soil.composition = data['composition']

        session.commit()

        return jsonify(soil.to_dict()), 200
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        session.close()


# ============== HISTORY / MOVEMENT ROUTES ==============

@app.route('/api/history/<int:plant_id>', methods=['GET'])
def get_plant_history(plant_id):
    """Get full pot history for a plant"""
    session = Session()
    try:
        plant = session.query(Plant).filter(Plant.id == plant_id).first()
        if not plant:
            return jsonify({'error': 'Plant not found'}), 404

        history = session.query(PlantPotHistory).filter(
            PlantPotHistory.plant_id == plant_id
        ).order_by(PlantPotHistory.start_date.desc()).all()

        return jsonify([h.to_dict() for h in history]), 200
    finally:
        session.close()


@app.route('/api/move', methods=['POST'])
def move_plant():
    """Move a plant to another pot"""
    session = Session()
    try:
        data = request.json

        plant_id = data['plant_id']
        pot_id = data['pot_id']
        soil_id = data['soil_id']
        start_date_str = data.get('start_date', date.today().isoformat())
        start_date_obj = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        notes = data.get('notes')

        # Verify plant, pot, and soil exist
        plant = session.query(Plant).filter(Plant.id == plant_id).first()
        pot = session.query(Pot).filter(Pot.id == pot_id).first()
        soil = session.query(Soil).filter(Soil.id == soil_id).first()

        if not plant:
            return jsonify({'error': 'Plant not found'}), 404
        if not pot:
            return jsonify({'error': 'Pot not found'}), 404
        if not soil:
            return jsonify({'error': 'Soil not found'}), 404

        # Close previous pot assignment for this plant
        previous_history = session.query(PlantPotHistory).filter(
            and_(PlantPotHistory.plant_id == plant_id,
                 PlantPotHistory.end_date.is_(None))
        ).first()

        if previous_history:
            previous_history.end_date = start_date_obj

        # Close any existing assignment for the target pot
        pot_history = session.query(PlantPotHistory).filter(
            and_(PlantPotHistory.pot_id == pot_id,
                 PlantPotHistory.end_date.is_(None))
        ).first()

        if pot_history:
            pot_history.end_date = start_date_obj

        # Create new history entry
        new_history = PlantPotHistory(
            plant_id=plant_id,
            pot_id=pot_id,
            soil_id=soil_id,
            start_date=start_date_obj,
            end_date=None,
            notes=notes
        )

        session.add(new_history)
        session.commit()

        # Return updated plant state
        plant_dict = plant.to_dict()
        plant_dict['current_pot'] = pot.to_dict()
        plant_dict['current_soil'] = soil.to_dict()

        return jsonify(plant_dict), 200
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        session.close()


# ============== STATIC FILES ==============

@app.route('/qrcodes/<filename>')
def serve_qr_code(filename):
    """Serve QR code images"""
    return send_from_directory('static/qrcodes', filename)


# ============== HEALTH CHECK ==============

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
