from app.db.database import SessionLocal
from app.models import models

def list_and_find():
    db = SessionLocal()
    try:
        stores = db.query(models.Store).all()
        print(f"{'ID':<5} {'Name':<20} {'Type':<15}")
        print("-" * 40)
        for s in stores:
            print(f"{s.store_id:<5} {s.store_name:<20} {s.store_type:<15}")
    finally:
        db.close()

if __name__ == "__main__":
    list_and_find()
