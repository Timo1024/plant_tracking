from sqlalchemy import create_engine, Column, Integer, String, Text, Date, Boolean, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import date

Base = declarative_base()


class Plant(Base):
    __tablename__ = 'plants'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    family = Column(String(100), nullable=False)
    genus = Column(String(100), nullable=False)
    species = Column(String(100), nullable=False)
    species2 = Column(String(100), nullable=True)
    variation = Column(String(100), nullable=True)
    size = Column(Enum('seedling', 'small', 'medium', 'large',
                  'giant', name='plant_size'), nullable=False)
    status = Column(Enum('active', 'removed', name='plant_status'),
                    default='active', nullable=False)
    removed_reason = Column(String(255), nullable=True)
    date_added = Column(Date, default=date.today, nullable=False)
    notes = Column(Text, nullable=True)

    # Relationships
    history = relationship(
        'PlantPotHistory', back_populates='plant', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'family': self.family,
            'genus': self.genus,
            'species': self.species,
            'species2': self.species2,
            'variation': self.variation,
            'size': self.size,
            'status': self.status,
            'removed_reason': self.removed_reason,
            'date_added': self.date_added.isoformat() if self.date_added else None,
            'notes': self.notes
        }


class Pot(Base):
    __tablename__ = 'pots'

    id = Column(Integer, primary_key=True, autoincrement=True)
    qr_code_id = Column(String(50), unique=True, nullable=False)
    room = Column(String(100), nullable=False)
    size = Column(String(50), nullable=False)
    notes = Column(Text, nullable=True)
    active = Column(Boolean, default=True, nullable=False)

    # Relationships
    history = relationship(
        'PlantPotHistory', back_populates='pot', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'qr_code_id': self.qr_code_id,
            'room': self.room,
            'size': self.size,
            'notes': self.notes,
            'active': self.active
        }


class Soil(Base):
    __tablename__ = 'soils'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    composition = Column(Text, nullable=False)

    # Relationships
    history = relationship('PlantPotHistory', back_populates='soil')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'composition': self.composition
        }


class PlantPotHistory(Base):
    __tablename__ = 'plant_pot_history'

    id = Column(Integer, primary_key=True, autoincrement=True)
    plant_id = Column(Integer, ForeignKey('plants.id'), nullable=False)
    pot_id = Column(Integer, ForeignKey('pots.id'), nullable=False)
    soil_id = Column(Integer, ForeignKey('soils.id'), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)

    # Relationships
    plant = relationship('Plant', back_populates='history')
    pot = relationship('Pot', back_populates='history')
    soil = relationship('Soil', back_populates='history')

    def to_dict(self):
        return {
            'id': self.id,
            'plant_id': self.plant_id,
            'pot_id': self.pot_id,
            'soil_id': self.soil_id,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'notes': self.notes,
            'plant': self.plant.to_dict() if self.plant else None,
            'pot': self.pot.to_dict() if self.pot else None,
            'soil': self.soil.to_dict() if self.soil else None
        }
