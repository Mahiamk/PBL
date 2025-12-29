from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import verify_password
from app.core.security import get_password_hash

def create_user(db: Session, *, user_in: UserCreate) -> User:
    db_obj = User(
        email=user_in.email,
        full_name=user_in.full_name,
        # We take 'password' from the JSON and hash it into 'hashed_password'
        hashed_password=get_password_hash(user_in.password), 
        is_active=user_in.is_active,
        role=user_in.role
    )
    # 2. Save to MySQL
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def authenticate(db: Session, *, email: str, password: str) -> User | None:
    # 1. Find the user
    user = get_user_by_email(db, email=email)
    if not user:
        return None
    
    # 2. Check the password
    if not verify_password(password, user.hashed_password):
        return None
        
    return user