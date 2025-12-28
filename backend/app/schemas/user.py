from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole

# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = True
    role: Optional[UserRole] = UserRole.CUSTOMER

# Received via API on registration
class UserCreate(UserBase):
    email: EmailStr
    password: str

# Returned via API
class User(UserBase):
    id: int

    class Config:
        from_attributes = True