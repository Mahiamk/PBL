from app.db.database import SessionLocal
from sqlalchemy import text

def migrate():
    db = SessionLocal()
    try:
        print("Adding reply_to_id column to MESSAGE table...")
        try:
            # Check if column exists first or just try adding it
            # Using generic SQL for MySQL
            db.execute(text("ALTER TABLE MESSAGE ADD COLUMN reply_to_id INT NULL"))
            db.execute(text("ALTER TABLE MESSAGE ADD CONSTRAINT fk_message_reply FOREIGN KEY (reply_to_id) REFERENCES MESSAGE(id) ON DELETE SET NULL"))
            print("reply_to_id added successfully.")
            db.commit()
        except Exception as e:
            print(f"Error adding reply_to_id (might already exist): {e}")
            
    except Exception as e:
        print(f"Migration failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
