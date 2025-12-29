from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any

from app.api import deps
from app.schemas.user import User, UserCreate
from app.services import user_service

router = APIRouter()

@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate
):
    """
    Create a new user (Registration).
    """
    # 1. Check if user already exists
    user = user_service.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists in the system.",
        )
    
    # 2. Create the user using our service logic
    return user_service.create_user(db, user_in=user_in)
@router.get("/me")
def read_user_me(
    current_user: User = Depends(deps.get_current_user) # This triggers the padlock!
):
    return current_user