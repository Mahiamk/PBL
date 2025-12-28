from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash

def create_user(db: Session, user_in: UserCreate) -> User:
    # 1. Transform the Schema into a Database Model
    db_obj = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password), # Hash it!
        full_name=user_in.full_name,
        role=user_in.role,
    )
    # 2. Save to MySQL
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()