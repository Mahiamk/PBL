from app.db.database import engine, Base
from sqlalchemy import text
from app.models.models import UserStatus

def update_schema():
    with engine.connect() as connection:
        # 1. Add status column to USER table if it doesn't exist
        try:
            connection.execute(text("ALTER TABLE USER ADD COLUMN status VARCHAR(50) DEFAULT 'active'"))
            print("Added 'status' column to USER table.")
        except Exception as e:
            print(f"Could not add 'status' column (might already exist): {e}")

        # 2. Create VENDOR_APPLICATION table
        # We can use SQLAlchemy's create_all for new tables, but let's be explicit for safety
        try:
            connection.execute(text("""
                CREATE TABLE IF NOT EXISTS VENDOR_APPLICATION (
                    application_id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    business_name VARCHAR(255) NOT NULL,
                    contact_details TEXT,
                    status VARCHAR(50) DEFAULT 'pending',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES USER(id)
                )
            """))
            print("Created VENDOR_APPLICATION table.")
        except Exception as e:
            print(f"Could not create VENDOR_APPLICATION table: {e}")

        # 3. Add vendor_type column to VENDOR_APPLICATION table
        try:
            connection.execute(text("ALTER TABLE VENDOR_APPLICATION ADD COLUMN vendor_type VARCHAR(50)"))
            print("Added 'vendor_type' column to VENDOR_APPLICATION table.")
        except Exception as e:
            print(f"Could not add 'vendor_type' column (might already exist): {e}")
            
        connection.commit()

if __name__ == "__main__":
    print("Updating database schema...")
    update_schema()
    print("Schema update complete.")