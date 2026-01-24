from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db

from app.models import models
from app.schemas import schemas

router = APIRouter(
    prefix="/newsletter",
    tags=["newsletter"]
)

@router.post("/subscribe", response_model=schemas.Subscriber)
def subscribe_newsletter(subscriber: schemas.SubscriberCreate, db: Session = Depends(get_db)):
    # Check if already subscribed
    existing = db.query(models.Subscriber).filter(models.Subscriber.email == subscriber.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already subscribed.")
    new_subscriber = models.Subscriber(email=subscriber.email)
    db.add(new_subscriber)
    db.commit()
    db.refresh(new_subscriber)
    return new_subscriber
