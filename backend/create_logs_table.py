import os
import sys
from sqlalchemy import create_engine, text

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SQLALCHEMY_DATABASE_URL
from app.models import models

def create_log_table():
    print("Creating SystemLog table...")
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    models.Base.metadata.create_all(bind=engine)
    print("Done.")

if __name__ == "__main__":
    create_log_table()
