from app.db.database import engine, Base
from sqlalchemy import text

def update_schema():
    with engine.connect() as connection:
        # Add store_id column to CATEGORY table
        try:
            connection.execute(text("ALTER TABLE CATEGORY ADD COLUMN STORE_ID INT"))
            connection.execute(text("ALTER TABLE CATEGORY ADD CONSTRAINT fk_category_store FOREIGN KEY (STORE_ID) REFERENCES STORE(STORE_ID)"))
            print("Added STORE_ID column to CATEGORY table.")
        except Exception as e:
            print(f"Error adding column (might already exist): {e}")

if __name__ == "__main__":
    print("Updating database schema...")
    update_schema()
    print("Schema update complete.")
