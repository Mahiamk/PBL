from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models import models
from app.schemas import schemas
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[schemas.Notification])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 50
):
    """
    Get all notifications for the current user.
    """
    notifications = db.query(models.Notification)\
        .filter(models.Notification.user_id == current_user.id)\
        .order_by(models.Notification.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    return notifications

@router.put("/{notification_id}/read", response_model=schemas.Notification)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Mark a specific notification as read.
    """
    notification = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this notification")
        
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification

@router.put("/read-all", response_model=List[schemas.Notification])
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Mark all notifications as read for current user.
    """
    db.query(models.Notification)\
        .filter(models.Notification.user_id == current_user.id, models.Notification.is_read == False)\
        .update({"is_read": True})
    
    db.commit()
    
    # Return updated list
    return db.query(models.Notification)\
        .filter(models.Notification.user_id == current_user.id)\
        .order_by(models.Notification.created_at.desc())\
        .limit(50)\
        .all()
