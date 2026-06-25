from app.db.database import SessionLocal, engine
from app.models import models
from sqlalchemy import text

def seed_stores():
    db = SessionLocal()
    try:
        # Check if stores exist
        count = db.query(models.Store).count()
        print(f"Current store count: {count}")
        
        stores_data = [
            {"store_id": 1, "store_name": "Tech Gadgets Hub", "store_type": "Electronics"},
            {"store_id": 2, "store_name": "Barber Shop", "store_type": "Services"},
            {"store_id": 3, "store_name": "Tailor Shop", "store_type": "Services"},
            {"store_id": 4, "store_name": "Bottle Shop", "store_type": "Retail"},
            {"store_id": 5, "store_name": "Drink Shop", "store_type": "Food & Beverage"},
            {"store_id": 6, "store_name": "Massage Service", "store_type": "Services"},
            {"store_id": 7, "store_name": "Clothing Shop", "store_type": "Fashion"},
        ]

        for store in stores_data:
            existing_store = db.query(models.Store).filter(models.Store.store_id == store["store_id"]).first()
            if not existing_store:
                print(f"Creating store: {store['store_name']}")
                # We need to insert with specific IDs. 
                # SQLAlchemy might ignore the id if autoincrement is on, unless we force it or the DB allows it.
                # For MySQL, usually providing the ID works if it doesn't conflict.
                new_store = models.Store(
                    store_id=store["store_id"],
                    store_name=store["store_name"],
                    store_type=store["store_type"]
                )
                db.add(new_store)
            else:
                print(f"Store exists: {store['store_name']}")
        
        db.commit()
        print("Seeding complete.")

    except Exception as e:
        print(f"Error seeding stores: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_stores()
