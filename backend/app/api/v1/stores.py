import shutil
import uuid
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.schemas.schemas import Store, StoreDetail, StoreUpdate, ServiceItem, Product
from app.db.database import get_db
from app.models import models
from app.api.deps import get_current_user
from app.core.config import settings

router = APIRouter()
UPLOAD_DIR = Path(settings.effective_upload_dir)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def verify_store_ownership(store_id: int, current_user: models.User, db: Session):
    """
    Ensure the user is either an Admin or the specific Vendor who owns the store.
    """
    if current_user.role == models.UserRole.ADMIN:
        return True

    if current_user.role == models.UserRole.VENDOR:
        vendor = db.query(models.Vendor).filter(models.Vendor.user_id == current_user.id).first()
        if vendor and vendor.store_id == store_id:
            return True

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have permission to modify this store"
    )


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


@router.put("/{store_id}/banner", response_model=Store)
@router.post("/{store_id}/banner", response_model=Store)
def update_store_banner(
    store_id: int,
    file: Optional[UploadFile] = File(None),
    image_url: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Allow vendors to upload or change their shop storefront banner.
    """
    store = db.query(models.Store).filter(models.Store.store_id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    verify_store_ownership(store_id, current_user, db)

    if file:
        try:
            file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
            file_name = f"banner_store_{store_id}_{uuid.uuid4()}.{file_extension}"
            file_path = UPLOAD_DIR / file_name

            with file_path.open("wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            store.image_url = f"/uploads/{file_name}"
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload banner: {e}")
    elif image_url is not None:
        clean_url = image_url.strip() if image_url else ""
        store.image_url = clean_url if clean_url and clean_url.lower() != "null" else None

    db.commit()
    db.refresh(store)
    return store


@router.delete("/{store_id}/banner", response_model=Store)
def delete_store_banner(
    store_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Allow vendors to remove/reset their shop storefront banner.
    """
    store = db.query(models.Store).filter(models.Store.store_id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    verify_store_ownership(store_id, current_user, db)

    store.image_url = None
    db.commit()
    db.refresh(store)
    return store


@router.put("/{store_id}", response_model=Store)
def update_store(
    store_id: int,
    store_update: StoreUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Update store profile attributes.
    """
    store = db.query(models.Store).filter(models.Store.store_id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    verify_store_ownership(store_id, current_user, db)

    update_data = store_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(store, field, value)

    db.commit()
    db.refresh(store)
    return store

