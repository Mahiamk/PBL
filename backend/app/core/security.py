from datetime import datetime, timedelta, timezone
from typing import Any, Union
from jose import jwt
import bcrypt
from app.core.config import settings

# 1. Password Hashing Configuration
# Replaced passlib with direct bcrypt usage to avoid compatibility issues with bcrypt >= 4.0.0

# 2. JWT Configuration
# HS256 is the standard algorithm for signing tokens
ALGORITHM = "HS256"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain text password against the hashed version from the database.
    Used during Login.
    """
    if not plain_password or not hashed_password:
        return False
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'), 
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt. 
    Used during User Registration.
    """
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def create_access_token(
    subject: Union[str, Any], expires_delta: timedelta = None
) -> str:
    """
    Generate a JSON Web Token (JWT) for a user session.
    'subject' is typically the user.id.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    # 'sub' (subject) is the standard JWT field for the identity of the user
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt