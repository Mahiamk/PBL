from app.db.database import SessionLocal
from app.models import models

def debug_categories():
    db = SessionLocal()
    try:
        categories = db.query(models.Category).all()
        print(f"Found {len(categories)} categories.")
        for cat in categories:
            print(f"ID: {cat.category_id} ({type(cat.category_id)})")
            print(f"Name: {cat.category_name} ({type(cat.category_name)})")
            print(f"Type: {cat.category_type} ({type(cat.category_type)})")
            print("-" * 20)
    finally:
        db.close()

if __name__ == "__main__":
    debug_categories()
