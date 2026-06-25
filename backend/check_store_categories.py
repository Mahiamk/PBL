from app.db.database import SessionLocal
from app.models import models

def check_drink_categories():
    db = SessionLocal()
    try:
        # Find Drink Shops
        drink_stores = db.query(models.Store).filter(models.Store.store_name.ilike("%Drink%")).all()
        
        for store in drink_stores:
            print(f"Store: {store.store_name} (ID: {store.store_id})")
            categories = db.query(models.Category).filter(models.Category.store_id == store.store_id).all()
            if not categories:
                print("  No categories found.")
            else:
                for cat in categories:
                    print(f"  - ID: {cat.category_id}, Name: {cat.category_name}, Type: {cat.category_type}")
            print("-" * 20)
            
    finally:
        db.close()

if __name__ == "__main__":
    check_drink_categories()
