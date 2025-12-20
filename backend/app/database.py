from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Credentials from docker-compose.yml
# Format: mysql+pymysql://user:password@hostname:port/database_name
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://user:password@db:3306/aiu_microstore"

# Create the SQLAlchemy engine
# "pool_pre_ping=True" helps handle connection drops common in Docker environments
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    pool_pre_ping=True
)

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# This will be used later in models.py to create the database tables
Base = declarative_base()

# Dependency for FastAPI routes to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()