from sqlalchemy import text
from app.db.database import SessionLocal
import sys

def upgrade():
    db = SessionLocal()
    try:
        print("Checking for missing columns in USER table...")
        
        # Check role
        try:
            # Try to select the column to see if it exists
            db.execute(text("SELECT role FROM USER LIMIT 1"))
            print("- 'role' column exists")
        except Exception as e:
            print(f"- 'role' column missing. Adding it... ({str(e).split(']')[0]}])")
            # Enum in MySQL can be implemented as ENUM or VARCHAR. 
            # Safer to add as VARCHAR for now to match the Enum values.
            try:
                db.execute(text("ALTER TABLE USER ADD COLUMN role VARCHAR(50) DEFAULT 'customer'"))
                print("  - Added 'role' column")
            except Exception as e_add:
                 print(f"  - Failed to add 'role': {e_add}")

        # Check status
        try:
            db.execute(text("SELECT status FROM USER LIMIT 1"))
            print("- 'status' column exists")
        except Exception:
            print("- 'status' column missing. Adding it...")
            try:
                db.execute(text("ALTER TABLE USER ADD COLUMN status VARCHAR(50) DEFAULT 'active'"))
                print("  - Added 'status' column")
            except Exception as e_add:
                 print(f"  - Failed to add 'status': {e_add}")

        # Check profile_image (Using the exact name from models.py which is "PROFILE_IMAGE")
        try:
            db.execute(text("SELECT PROFILE_IMAGE FROM USER LIMIT 1"))
            print("- 'PROFILE_IMAGE' column exists")
        except Exception:
            print("- 'PROFILE_IMAGE' column missing. Adding it...")
            try:
                db.execute(text("ALTER TABLE USER ADD COLUMN PROFILE_IMAGE TEXT NULL"))
                print("  - Added 'PROFILE_IMAGE' column")
            except Exception as e_add:
                 print(f"  - Failed to add 'PROFILE_IMAGE': {e_add}")

        db.commit()
        print("Migration complete.")
    except Exception as e:
        print(f"Migration failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    upgrade()
