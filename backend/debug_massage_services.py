import os
import sys

# Add the parent directory to sys.path to resolve 'app'
sys.path.append(os.getcwd())

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import models
from app.models.models import Service, Category, Store

from sqlalchemy import text

def debug_services():
    # Try connecting with root since user might have restricted access
    url = "mysql+pymysql://root:rootpassword@127.0.0.1:3306/PBL"
    
    try:
        engine = create_engine(url)
        SessionLocal = sessionmaker(bind=engine)
        db = SessionLocal()
        # Test connection
        db.execute(text("SELECT 1"))
        print(f"Connected to {url}")
    except Exception as e:
        print(f"Failed to connect to {url}: {e}")
        print("Trying aiu_microstore with root...")
        url = "mysql+pymysql://root:rootpassword@127.0.0.1:3306/aiu_microstore"
        engine = create_engine(url)
        SessionLocal = sessionmaker(bind=engine)
        db = SessionLocal()
        try:
             db.execute(text("SELECT 1"))
             print(f"Connected to {url}")
        except Exception as e2:
             print(f"Failed again: {e2}")
             return

    try:
        store_id = 6
        print(f"\n--- Debugging Services for Store {store_id} ---")
        services = db.query(Service).filter(Service.store_id == store_id).all()
        if not services:
            print("No services found.")
        else:
            print(f"Found {len(services)} services:")
            for s in services:
                # print details
                print(f"ID: {s.service_id}, Name: {s.service_name}, CatID: {s.category_id}, Price: {s.service_price}")

        print(f"\n--- Debugging Categories for Store {store_id} ---")
        categories = db.query(Category).filter(Category.store_id == store_id).all()
        if not categories:
            print("No categories found.")
        else:
            print(f"Found {len(categories)} categories:")
            for c in categories:
                print(f"ID: {c.category_id}, Name: {c.category_name}, Type: {c.category_type}, StoreID: {c.store_id}")
                
        # Also check if the store exists
        store = db.query(Store).filter(Store.store_id == store_id).first()
        if store:
             print(f"\nStore found: {store.store_name} (ID: {store.store_id})")
        else:
             print(f"\nStore ID {store_id} NOT FOUND.")

    except Exception as e:
        print(f"Error executing queries: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug_services()
