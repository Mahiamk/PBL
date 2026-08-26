from app.db.database import engine
from sqlalchemy import text, inspect

def update_store_schema():
    insp = inspect(engine)
    existing_cols = [c['name'].upper() for c in insp.get_columns('STORE')]
    print(f"Existing columns in STORE: {existing_cols}")

    with engine.connect() as conn:
        cols_to_add = [
            ("WORKING_HOURS", "VARCHAR(100) NULL DEFAULT '09:00 AM - 08:00 PM'"),
            ("LOCATION", "VARCHAR(255) NULL DEFAULT 'AIU Student Center'"),
            ("PHONE", "VARCHAR(50) NULL"),
            ("DESCRIPTION", "TEXT NULL"),
            ("STATUS", "VARCHAR(50) NULL DEFAULT 'active'")
        ]

        for col_name, col_type in cols_to_add:
            if col_name not in existing_cols:
                try:
                    print(f"Adding column {col_name}...")
                    conn.execute(text(f"ALTER TABLE STORE ADD COLUMN {col_name} {col_type};"))
                    conn.commit()
                    print(f"Added {col_name} successfully.")
                except Exception as e:
                    print(f"Failed to add {col_name}: {e}")
            else:
                print(f"Column {col_name} already exists.")

    print("Store schema migration completed.")

if __name__ == "__main__":
    update_store_schema()
