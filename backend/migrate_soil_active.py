"""
Migration script to add 'active' column to soils table
"""
import os
from sqlalchemy import create_engine, text

# Database connection
DATABASE_URL = os.getenv(
    'DATABASE_URL', 'mysql+pymysql://tracker:trackerpass@db:3306/planttracker')

engine = create_engine(DATABASE_URL)


def migrate():
    print("Adding 'active' column to soils table...")

    with engine.connect() as conn:
        # Check if column exists
        result = conn.execute(text("""
            SELECT COUNT(*) as count
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'planttracker'
            AND TABLE_NAME = 'soils'
            AND COLUMN_NAME = 'active'
        """))

        exists = result.fetchone()[0] > 0

        if exists:
            print("Column 'active' already exists. Skipping migration.")
        else:
            # Add the column with default value True
            conn.execute(text("""
                ALTER TABLE soils
                ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE
            """))
            conn.commit()
            print("Successfully added 'active' column to soils table!")


if __name__ == "__main__":
    migrate()
