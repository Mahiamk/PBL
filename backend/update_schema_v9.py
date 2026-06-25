from sqlalchemy import text
from app.db.database import engine

def update_schema():
    print(f"Connecting using engine: {engine.url}")
    with engine.connect() as connection:
        try:
            # Check if column exists, but "PRAGMA" is sqlite specific.
            # For MySQL, we can just try to add it and catch exception, or check information_scheme
            # Simpler: just try to add.
            try:
                connection.execute(text("ALTER TABLE PRODUCT ADD COLUMN CUSTOM_OPTIONS TEXT"))
                print("Successfully added CUSTOM_OPTIONS column to PRODUCT table")
            except Exception as e:
                # Catch MySQL specific error code for duplicate column if possible, but printing is fine.
                print(f"Could not add column (might exist): {e}")
        except Exception as e:
            print(f"Connection Error: {e}")

if __name__ == "__main__":
    update_schema()
