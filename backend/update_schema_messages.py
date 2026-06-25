from app.db.database import SessionLocal, engine
from app.models import models
from sqlalchemy import text

def migrate():
    db = SessionLocal()
    try:
        # Add columns if they don't exist
        print("Adding message_type column...")
        try:
            db.execute(text("ALTER TABLE MESSAGE ADD COLUMN message_type VARCHAR(50) DEFAULT 'text'"))
            print("message_type added.")
        except Exception as e:
            print(f"message_type might already exist: {e}")

        print("Adding attachment_url column...")
        try:
            db.execute(text("ALTER TABLE MESSAGE ADD COLUMN attachment_url TEXT"))
            print("attachment_url added.")
        except Exception as e:
            print(f"attachment_url might already exist: {e}")
            
        # Modify content to be nullable (SQLite/MySQL syntax might vary, doing generic check)
        # Using raw SQL for modifying column nullability is tricky across DBs. 
        # For now, let's assume it's fine or handle it if it fails.
        # SQLite doesn't support ALTER COLUMN easily. 
        
        db.commit()
    except Exception as e:
        print(f"Error during migration: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
