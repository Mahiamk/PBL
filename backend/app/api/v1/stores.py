from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.schemas import Store
from app.db.database import get_db
from app.models import models

router = APIRouter()


@router.get("/", response_model=List[Store])
def get_stores(db: Session = Depends(get_db)):
    # Only return stores that have a registered Vendor owner
    # And filter out specific test/default stores
    return db.query(models.Store).join(models.Vendor).filter(
        models.Store.store_name != "Default Store",
        models.Store.store_name != "Barber Shop",
        models.Store.store_name != "Tailor Shop"
    ).distinct().all()

@router.get("/{store_id}", response_model=Store)
def get_store(store_id: int, db: Session = Depends(get_db)):
    return db.query(models.Store).filter(models.Store.store_id == store_id).first()
