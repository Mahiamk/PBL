from app.db.database import SessionLocal, engine
from app.models import models
from sqlalchemy import text

def migrate():
    print("Creating NOTIFICATION table...")
    try:
        models.Base.metadata.create_all(bind=engine)
        print("Schema update complete.")
    except Exception as e:
        print(f"Error updating schema: {e}")

if __name__ == "__main__":
    migrate()
