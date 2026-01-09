from pydantic import BaseModel, ConfigDict, computed_field
from typing import Optional
from datetime import datetime
from app.models.models import UserRole, UserStatus

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    store_id: Optional[int] = None
    vendor_type: Optional[str] = None # Added vendor_type
    profile_image: Optional[str] = None # Added profile_image
    full_name: Optional[str] = None # Added user full name
    email: Optional[str] = None # Added user email

class TokenData(BaseModel):
    username: Optional[str] = None

class UserCreate(BaseModel):
    email: str
    password: str
    # 3NF Normalized: Split full_name into separate fields
    first_name: str
    last_name: str
    initial: Optional[str] = None  # Middle initial (optional)
    phone_number: Optional[str] = None  # User phone number
    role: UserRole = UserRole.CUSTOMER

class VendorRegister(UserCreate):
    business_name: str
    contact_details: Optional[str] = None
    vendor_type: str
    role: UserRole = UserRole.VENDOR

class UserResponse(BaseModel):
    id: int
    email: str
    # 3NF Normalized name fields
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    initial: Optional[str] = None
    phone_number: Optional[str] = None  # User phone number
    role: UserRole
    # Changed from UserStatus to str to accept 'ACTIVE' or 'active' from DB
    status: str
    vendor_type: Optional[str] = None # Added vendor_type
    profile_image: Optional[str] = None
    
    # Computed full_name for backward compatibility
    @computed_field
    @property
    def full_name(self) -> Optional[str]:
        """Computed full name from first_name, initial, and last_name"""
        parts = [self.first_name]
        if self.initial:
            parts.append(self.initial)
        if self.last_name:
            parts.append(self.last_name)
        return " ".join(filter(None, parts)) or None
    
    @computed_field
    @property
    def is_active(self) -> bool:
        """Computed is_active from status for backward compatibility"""
        return self.status == "active"

    model_config = ConfigDict(from_attributes=True)

class VendorApplicationResponse(BaseModel):
    application_id: int
    user_id: int
    business_name: str
    # Changed from UserStatus to str to accept 'ACTIVE' or 'active' from DB
    status: str
    vendor_type: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

