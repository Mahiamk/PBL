import os
import sys
from sqlalchemy import create_engine, text
from datetime import timedelta

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SQLALCHEMY_DATABASE_URL

def convert_to_normalized_schema():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    connection = engine.connect()
    
    print("Starting normalization of Appointments and Services...")
    
    try:
        # 1. Create SERVICE_PROVIDER Table
        print("Creating SERVICE_PROVIDER table...")
        connection.execute(text("""
        CREATE TABLE IF NOT EXISTS SERVICE_PROVIDER (
            PROVIDER_ID INT AUTO_INCREMENT PRIMARY KEY,
            NAME VARCHAR(100) NOT NULL,
            CONTACT VARCHAR(255),
            STORE_ID INT NOT NULL,
            FOREIGN KEY (STORE_ID) REFERENCES STORE(STORE_ID)
        )
        """))
        
        # 2. Create TIME_SLOT Table
        print("Creating TIME_SLOT table...")
        connection.execute(text("""
        CREATE TABLE IF NOT EXISTS TIME_SLOT (
            SLOT_ID INT AUTO_INCREMENT PRIMARY KEY,
            START_TIME DATETIME NOT NULL,
            END_TIME DATETIME NOT NULL,
            SERVICE_ID INT NOT NULL,
            FOREIGN KEY (SERVICE_ID) REFERENCES SERVICE(SERVICE_ID)
        )
        """))
        
        # 3. Alter APPOINTMENT Table to add new FK columns (if they don't exist)
        print("Altering APPOINTMENT table...")
        # Check if column exists is hard in raw SQL generic, but we can just Try/Catch or use "ADD COLUMN IF NOT EXISTS" for specific DB versions (MySQL 8.0 support this?)
        # For MySQL:
        try:
            connection.execute(text("ALTER TABLE APPOINTMENT ADD COLUMN SLOT_ID INT"))
        except Exception as e:
            print(f"SLOT_ID might already exist: {e}")
            
        try:
            connection.execute(text("ALTER TABLE APPOINTMENT ADD COLUMN PROVIDER_ID INT"))
        except Exception as e:
            print(f"PROVIDER_ID might already exist: {e}")
            
        try:
            connection.execute(text("ALTER TABLE APPOINTMENT ADD CONSTRAINT fk_appt_slot FOREIGN KEY (SLOT_ID) REFERENCES TIME_SLOT(SLOT_ID)"))
        except Exception as e:
            pass
            
        try:
            connection.execute(text("ALTER TABLE APPOINTMENT ADD CONSTRAINT fk_appt_provider FOREIGN KEY (PROVIDER_ID) REFERENCES SERVICE_PROVIDER(PROVIDER_ID)"))
        except Exception as e:
            pass
            
        # 4. Migrate Data
        print("Migrating data...")
        
        # Fetch existing appointments
        appts = connection.execute(text("SELECT APPOINTMENT_ID, STORE_ID, BARBER_NAME, SERVICE_NAME, BOOKING_DATE FROM APPOINTMENT")).fetchall()
        
        # Cache for Providers and Services
        providers_cache = {} # (name, store_id) -> id
        services_cache = {}  # (name, store_id) -> id
        
        # Helper to get/create provider
        def get_or_create_provider(name, store_id):
            key = (name, store_id)
            if key in providers_cache:
                return providers_cache[key]
            
            # Check DB
            try:
                # If name is None, skip?
                if not name:
                    return None
                    
                res = connection.execute(text("SELECT PROVIDER_ID FROM SERVICE_PROVIDER WHERE NAME = :name AND STORE_ID = :sid LIMIT 1"), {"name": name, "sid": store_id}).fetchone()
                if res:
                    pid = res[0]
                else:
                    # Create
                    cursor = connection.execute(text("INSERT INTO SERVICE_PROVIDER (NAME, STORE_ID) VALUES (:name, :sid)"), {"name": name, "sid": store_id})
                    pid = cursor.lastrowid
                
                providers_cache[key] = pid
                return pid
            except Exception as e:
                print(f"Error getting provider {name}: {e}")
                return None

        # Helper to get service
        def get_service_id(name, store_id):
            key = (name, store_id)
            if key in services_cache:
                return services_cache[key]
            
            # Check DB
            # Try exact match
            res = connection.execute(text("SELECT SERVICE_ID FROM SERVICE WHERE SERVICE_NAME = :name AND STORE_ID = :sid LIMIT 1"), {"name": name, "sid": store_id}).fetchone()
            if res:
                sid = res[0]
                services_cache[key] = sid
                return sid
            
            # Try match by name only (if store mismatch or legacy)
            res = connection.execute(text("SELECT SERVICE_ID FROM SERVICE WHERE SERVICE_NAME = :name LIMIT 1"), {"name": name}).fetchone()
            if res:
                return res[0]
                
            return None

        count = 0
        for appt in appts:
            aid, store_id, b_name, s_name, b_date = appt
            
            # 1. Provider
            pid = get_or_create_provider(b_name, store_id)
            
            # 2. Service
            sid = get_service_id(s_name, store_id)
            
            if sid and b_date:
                # 3. Create TimeSlot
                # Default duration 1 hour
                end_time = b_date + timedelta(hours=1)
                
                # Check if specific slot already exists? (Maybe unnecessary for migration, just create new)
                try:
                    ts_res = connection.execute(text(
                        "INSERT INTO TIME_SLOT (START_TIME, END_TIME, SERVICE_ID) VALUES (:start, :end, :sid)"
                    ), {"start": b_date, "end": end_time, "sid": sid})
                    slot_id = ts_res.lastrowid
                    
                    # 4. Update Appointment
                    connection.execute(text(
                        "UPDATE APPOINTMENT SET SLOT_ID = :slot_id, PROVIDER_ID = :pid WHERE APPOINTMENT_ID = :aid"
                    ), {"slot_id": slot_id, "pid": pid, "aid": aid})
                    count += 1
                except Exception as e:
                    print(f"Error migrating appt {aid}: {e}")
            else:
                print(f"Skipping appt {aid}: Missing service ({s_name}) or date.")
        
        connection.commit()
        print(f"Successfully migrated {count} appointments.")
        
        # 5. Drop old columns?
        # print("Dropping old columns from APPOINTMENT...")
        # connection.execute(text("ALTER TABLE APPOINTMENT DROP COLUMN BARBER_NAME"))
        # connection.execute(text("ALTER TABLE APPOINTMENT DROP COLUMN SERVICE_NAME"))
        # connection.execute(text("ALTER TABLE APPOINTMENT DROP COLUMN BOOKING_DATE"))
        # print("Columns dropped.")
        
    except Exception as e:
        print(f"An error occurred: {e}")
        connection.rollback()
    finally:
        connection.close()
        print("Done.")

if __name__ == "__main__":
    convert_to_normalized_schema()
