from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.schemas import Store, StoreDetail, ServiceItem, Product
from app.db.database import get_db
from app.models import models

router = APIRouter()


@router.get("", response_model=List[Store])
@router.get("/", response_model=List[Store])
def get_stores(db: Session = Depends(get_db)):
    """
    Return all active campus stores.
    """
    stores = db.query(models.Store).filter(
        models.Store.store_name != "Default Store",
        (models.Store.status == "active") | (models.Store.status == None)
    ).all()
    return stores


@router.get("/{store_id}", response_model=Store)
def get_store(store_id: int, db: Session = Depends(get_db)):
    store = db.query(models.Store).filter(models.Store.store_id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return store


@router.get("/{store_id}/detail", response_model=StoreDetail)
def get_store_detail(store_id: int, db: Session = Depends(get_db)):
    store = db.query(models.Store).filter(models.Store.store_id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    
    services = db.query(models.Service).filter(
        models.Service.store_id == store_id,
        models.Service.status == "active"
    ).all()

    products = db.query(models.Product).filter(
        models.Product.store_id == store_id,
        models.Product.status == "active"
    ).all()

    return {
        "store_id": store.store_id,
        "store_name": store.store_name,
        "store_type": store.store_type,
        "image_url": store.image_url,
        "working_hours": store.working_hours,
        "location": store.location,
        "phone": store.phone,
        "description": store.description,
        "status": store.status,
        "services": services,
        "products": products
    }

