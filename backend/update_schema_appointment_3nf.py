"""
Migration script to update APPOINTMENT table to 3NF.
Adds SLOT_ID and PROVIDER_ID columns and Foreign Keys.
"""
from sqlalchemy import text
from app.db.database import SessionLocal
import sys

def migrate_appointment_schema():
    db = SessionLocal()
    try:
        print("Checking APPOINTMENT table schema...")
        
        # Check existing columns
        columns = db.execute(text("SHOW COLUMNS FROM APPOINTMENT")).fetchall()
        column_names = [col[0] for col in columns]
        
        # 1. Add PROVIDER_ID if missing
        if "PROVIDER_ID" not in column_names:
            print("Adding PROVIDER_ID column...")
            db.execute(text("""
                ALTER TABLE APPOINTMENT 
                ADD COLUMN PROVIDER_ID INT,
                ADD CONSTRAINT fk_appt_provider 
                FOREIGN KEY (PROVIDER_ID) REFERENCES SERVICE_PROVIDER(PROVIDER_ID)
            """))
            print("  - Added PROVIDER_ID")
        else:
            print("  - PROVIDER_ID already exists")

        # 2. Add SLOT_ID if missing
        if "SLOT_ID" not in column_names:
            print("Adding SLOT_ID column...")
            db.execute(text("""
                ALTER TABLE APPOINTMENT 
                ADD COLUMN SLOT_ID INT,
                ADD CONSTRAINT fk_appt_slot 
                FOREIGN KEY (SLOT_ID) REFERENCES TIME_SLOT(SLOT_ID)
            """))
            print("  - Added SLOT_ID")
        else:
            print("  - SLOT_ID already exists")
            
        db.commit()
        print("✅ APPOINTMENT table schema updated successfully!")
        
    except Exception as e:
        print(f"❌ Error migrating schema: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    migrate_appointment_schema()
