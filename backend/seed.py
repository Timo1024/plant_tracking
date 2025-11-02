"""
Seed script to populate the database with sample data
"""
from models import Base, Plant, Pot, Soil, PlantPotHistory
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from datetime import date, timedelta
import os
import sys

# Add parent directory to path to import models
sys.path.append(os.path.dirname(os.path.abspath(__file__)))


# Database connection
DATABASE_URL = os.getenv(
    'DATABASE_URL', 'mysql+pymysql://tracker:trackerpass@localhost:3306/planttracker')
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)


def seed_database():
    session = Session()

    try:
        # Create tables
        Base.metadata.create_all(engine)

        # Clear existing data
        session.query(PlantPotHistory).delete()
        session.query(Plant).delete()
        session.query(Pot).delete()
        session.query(Soil).delete()
        session.commit()

        print("Creating sample soils...")
        # Create soil mixes
        soils = [
            Soil(
                name="Aroid Mix",
                composition="40% orchid bark, 30% perlite, 20% peat moss, 10% charcoal"
            ),
            Soil(
                name="Succulent Mix",
                composition="50% potting soil, 30% coarse sand, 20% perlite"
            ),
            Soil(
                name="Standard Potting Mix",
                composition="60% peat moss, 30% perlite, 10% vermiculite"
            ),
            Soil(
                name="Cactus Mix",
                composition="40% potting soil, 40% coarse sand, 20% perlite"
            ),
        ]

        for soil in soils:
            session.add(soil)
        session.commit()
        print(f"Created {len(soils)} soil mixes")

        print("Creating sample pots...")
        # Create pots
        pots = [
            Pot(qr_code_id="POT-001", room="Living Room",
                size="15 cm", active=True),
            Pot(qr_code_id="POT-002", room="Bedroom", size="20 cm", active=True),
            Pot(qr_code_id="POT-003", room="Kitchen", size="12 cm", active=True),
            Pot(qr_code_id="POT-004", room="Balcony", size="25 cm", active=True),
            Pot(qr_code_id="POT-005", room="Office", size="18 cm", active=True),
        ]

        for pot in pots:
            session.add(pot)
        session.commit()
        print(f"Created {len(pots)} pots")

        print("Creating sample plants...")
        # Create plants
        plants = [
            Plant(
                name="Monstera Deliciosa",
                family="Araceae",
                genus="Monstera",
                species="deliciosa",
                size="medium",
                status="active",
                date_added=date.today() - timedelta(days=365),
                notes="Beautiful fenestrations!"
            ),
            Plant(
                name="Snake Plant",
                family="Asparagaceae",
                genus="Sansevieria",
                species="trifasciata",
                variation="Laurentii",
                size="small",
                status="active",
                date_added=date.today() - timedelta(days=180),
                notes="Very low maintenance"
            ),
            Plant(
                name="Pothos",
                family="Araceae",
                genus="Epipremnum",
                species="aureum",
                size="small",
                status="active",
                date_added=date.today() - timedelta(days=90),
                notes="Fast grower"
            ),
            Plant(
                name="Fiddle Leaf Fig",
                family="Moraceae",
                genus="Ficus",
                species="lyrata",
                size="large",
                status="active",
                date_added=date.today() - timedelta(days=200),
                notes="Needs bright indirect light"
            ),
            Plant(
                name="Jade Plant",
                family="Crassulaceae",
                genus="Crassula",
                species="ovata",
                size="small",
                status="active",
                date_added=date.today() - timedelta(days=300)
            ),
        ]

        for plant in plants:
            session.add(plant)
        session.commit()
        print(f"Created {len(plants)} plants")

        print("Creating plant-pot history...")
        # Create plant-pot assignments
        histories = [
            # Monstera in Living Room pot
            PlantPotHistory(
                plant_id=plants[0].id,
                pot_id=pots[0].id,
                soil_id=soils[0].id,  # Aroid Mix
                start_date=date.today() - timedelta(days=365),
                notes="Initial potting"
            ),
            # Snake Plant in Bedroom pot
            PlantPotHistory(
                plant_id=plants[1].id,
                pot_id=pots[1].id,
                soil_id=soils[2].id,  # Standard Potting Mix
                start_date=date.today() - timedelta(days=180),
                notes="First pot"
            ),
            # Pothos in Kitchen pot
            PlantPotHistory(
                plant_id=plants[2].id,
                pot_id=pots[2].id,
                soil_id=soils[0].id,  # Aroid Mix
                start_date=date.today() - timedelta(days=90),
                notes="Propagated from cutting"
            ),
            # Fiddle Leaf Fig in Balcony pot
            PlantPotHistory(
                plant_id=plants[3].id,
                pot_id=pots[3].id,
                soil_id=soils[2].id,  # Standard Potting Mix
                start_date=date.today() - timedelta(days=200),
                end_date=date.today() - timedelta(days=50),
                notes="First pot - outgrew it"
            ),
            # Fiddle Leaf Fig repotted to Office pot
            PlantPotHistory(
                plant_id=plants[3].id,
                pot_id=pots[4].id,
                soil_id=soils[2].id,  # Standard Potting Mix
                start_date=date.today() - timedelta(days=50),
                notes="Repotted to larger pot"
            ),
            # Jade Plant not yet potted (will be assigned later)
        ]

        for history in histories:
            session.add(history)
        session.commit()
        print(f"Created {len(histories)} history records")

        print("\n✅ Database seeded successfully!")
        print(f"   - {len(soils)} soil mixes")
        print(f"   - {len(pots)} pots")
        print(f"   - {len(plants)} plants")
        print(f"   - {len(histories)} history records")

    except Exception as e:
        session.rollback()
        print(f"\n❌ Error seeding database: {e}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    print("Seeding database with sample data...")
    seed_database()
