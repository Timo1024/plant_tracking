"""
Generate QR codes for pots that don't have them
"""
import os
import sys
from app import Session, Pot, generate_qr_code


def generate_missing_qr_codes():
    session = Session()

    try:
        pots = session.query(Pot).all()
        generated = 0

        for pot in pots:
            qr_path = f"static/qrcodes/{pot.qr_code_id}.png"
            if not os.path.exists(qr_path):
                print(f"Generating QR code for pot: {pot.qr_code_id}")
                generate_qr_code(pot.qr_code_id)
                generated += 1
            else:
                print(f"QR code already exists for pot: {pot.qr_code_id}")

        print(f"\nGenerated {generated} new QR codes!")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        session.close()


if __name__ == "__main__":
    generate_missing_qr_codes()
