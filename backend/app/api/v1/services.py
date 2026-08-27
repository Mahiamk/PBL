from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from app.db.database import get_db
from app.models import models
from app.api.deps import get_current_user
from app.models.models import User, UserRole

router = APIRouter()

class ServiceCreate(BaseModel):
    service_name: str
    service_desc: Optional[str] = None
    service_price: float
    image_url: Optional[str] = None
    store_id: int
    status: Optional[str] = "active"

class ServiceUpdate(BaseModel):
    service_name: Optional[str] = None
    service_desc: Optional[str] = None
    service_price: Optional[float] = None
    image_url: Optional[str] = None
    status: Optional[str] = None

class ServiceResponse(BaseModel):
    service_id: int
    service_name: str
    service_desc: Optional[str] = None
    service_price: float
    image_url: Optional[str] = None
    store_id: int
    status: Optional[str] = "active"
    store_name: Optional[str] = None
    store_type: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

@router.post("/", response_model=ServiceResponse)
def create_service(
    service: ServiceCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify store ownership
    if current_user.role != UserRole.ADMIN:
        vendor = db.query(models.Vendor).filter(models.Vendor.user_id == current_user.id).first()
        if not vendor or vendor.store_id != service.store_id:
             raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to add services to this store"
            )

    store = db.query(models.Store).filter(models.Store.store_id == service.store_id).first()

    db_service = models.Service(
        service_name=service.service_name,
        service_desc=service.service_desc,
        service_price=service.service_price,
        image_url=service.image_url,
        store_id=service.store_id,
        status=service.status or "active"
    )
    db.add(db_service)
    db.commit()
    db.refresh(db_service)

    return ServiceResponse(
        service_id=db_service.service_id,
        service_name=db_service.service_name,
        service_desc=db_service.service_desc,
        service_price=float(db_service.service_price),
        image_url=db_service.image_url,
        store_id=db_service.store_id,
        status=db_service.status,
        store_name=store.store_name if store else None,
        store_type=store.store_type if store else None
    )

@router.get("", response_model=List[ServiceResponse])
@router.get("/", response_model=List[ServiceResponse])
def get_services(store_id: Optional[int] = None, db: Session = Depends(get_db)):
    # Join with Store to get store details
    query = db.query(models.Service, models.Store)\
        .join(models.Store, models.Service.store_id == models.Store.store_id)

    if store_id:
        query = query.filter(models.Service.store_id == store_id)
    
    results = query.all()
    response = []
    for service, store in results:
        service_dict = {
            "service_id": service.service_id,
            "service_name": service.service_name,
            "service_desc": service.service_desc,
            "service_price": float(service.service_price),
            "image_url": service.image_url,
            "store_id": service.store_id,
            "status": service.status or "active",
            "store_name": store.store_name if store else None,
            "store_type": store.store_type if store else None
        }
        response.append(service_dict)
    return response

@router.put("/{service_id}", response_model=ServiceResponse)
def update_service(
    service_id: int,
    service_update: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = db.query(models.Service).filter(models.Service.service_id == service_id).first()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")

    if current_user.role != UserRole.ADMIN:
        vendor = db.query(models.Vendor).filter(models.Vendor.user_id == current_user.id).first()
        if not vendor or vendor.store_id != service.store_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this service")

    if service_update.service_name is not None:
        service.service_name = service_update.service_name
    if service_update.service_desc is not None:
        service.service_desc = service_update.service_desc
    if service_update.service_price is not None:
        service.service_price = service_update.service_price
    if service_update.image_url is not None:
        service.image_url = service_update.image_url
    if service_update.status is not None:
        service.status = service_update.status

    db.commit()
    db.refresh(service)

    store = db.query(models.Store).filter(models.Store.store_id == service.store_id).first()
    return ServiceResponse(
        service_id=service.service_id,
        service_name=service.service_name,
        service_desc=service.service_desc,
        service_price=float(service.service_price),
        image_url=service.image_url,
        store_id=service.store_id,
        status=service.status,
        store_name=store.store_name if store else None,
        store_type=store.store_type if store else None
    )

@router.delete("/{service_id}")
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = db.query(models.Service).filter(models.Service.service_id == service_id).first()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")

    if current_user.role != UserRole.ADMIN:
        vendor = db.query(models.Vendor).filter(models.Vendor.user_id == current_user.id).first()
        if not vendor or vendor.store_id != service.store_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this service")

    db.delete(service)
    db.commit()
    return {"message": "Service deleted successfully", "service_id": service_id}