from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.schemas import Review, ReviewCreate
from app.models import models
from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.models import User
from typing import List, Optional

router = APIRouter()

@router.post("/", response_model=Review)
def create_review(review: ReviewCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_review = models.Review(
        customer_id=current_user.id,
        customer_name=(current_user.full_name or current_user.email or "Unknown"),
        store_id=review.store_id,
        barber_name=review.barber_name,
        rating=review.rating,
        comment=review.comment
    )
    
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

@router.get("/", response_model=List[Review])
def get_reviews(store_id: Optional[int] = None, barber_name: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Review)
    
    if store_id:
        query = query.filter(models.Review.store_id == store_id)
    
    if barber_name:
        query = query.filter(models.Review.barber_name == barber_name)
        
    return query.order_by(models.Review.created_at.desc()).all()
