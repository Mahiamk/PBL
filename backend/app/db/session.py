from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# 1. Create the engine
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

# 2. Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. Dependency: This is what will be used in API routes later
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()