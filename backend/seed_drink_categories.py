from app.db.database import SessionLocal
from app.models import models

def seed_drink_categories():
    db = SessionLocal()
    try:
        categories_to_add = [
            {"name": "Coffee", "type": "Beverage"},
            {"name": "Tea", "type": "Beverage"},
            {"name": "Cocoa", "type": "Beverage"},
            {"name": "Milk", "type": "Beverage"},
            {"name": "Soda", "type": "Beverage"},
            {"name": "Waffle", "type": "Food"},
            {"name": "Water", "type": "Beverage"}
        ]

        # Find Drink Shops
        drink_stores = db.query(models.Store).filter(models.Store.store_name.ilike("%Drink%")).all()
        
        if not drink_stores:
             # Fallback to ID 5 if name doesn't match
             store = db.query(models.Store).filter(models.Store.store_id == 5).first()
             if store:
                 drink_stores.append(store)

        for store in drink_stores:
            print(f"Seeding categories for {store.store_name} (ID: {store.store_id})...")
            
            for cat_data in categories_to_add:
                # Check if exists
                exists = db.query(models.Category).filter(
                    models.Category.store_id == store.store_id,
                    models.Category.category_name == cat_data["name"]
                ).first()
                
                if not exists:
                    new_cat = models.Category(
                        category_name=cat_data["name"],
                        category_type=cat_data["type"],
                        store_id=store.store_id
                    )
                    db.add(new_cat)
                    print(f"  Added: {cat_data['name']}")
                else:
                    print(f"  Skipped (Exists): {cat_data['name']}")
        
        db.commit()
        print("Seeding complete.")

    except Exception as e:
        print(f"Error seeding categories: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_drink_categories()
