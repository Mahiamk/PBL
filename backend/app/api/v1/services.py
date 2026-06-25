from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from app.db.database import get_db
from app.models import models
from app.api.deps import get_current_user
from app.models.models import User, UserRole

router = APIRouter()

class ServiceCreate(BaseModel):
    service_name: str
    service_desc: str = None
    service_price: float
    image_url: str = None
    store_id: int
    status: str = "active"

class ServiceResponse(ServiceCreate):
    service_id: int
    store_name: str = None
    store_type: str = None

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
                status_code=403,
                detail="Not authorized to add services to this store"
            )

    db_service = models.Service(
        service_name=service.service_name,
        service_desc=service.service_desc,
        service_price=service.service_price,
        image_url=service.image_url,
        store_id=service.store_id,
        status=service.status
    )
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

@router.get("/", response_model=List[ServiceResponse])
def get_services(store_id: int = None, db: Session = Depends(get_db)):
    # Join with Store to get store details
    # Join with Vendor to ensure the store has a valid vendor owner (filters out orphan seed stores)
    query = db.query(models.Service, models.Store)\
        .join(models.Store, models.Service.store_id == models.Store.store_id)\
        .join(models.Vendor, models.Store.store_id == models.Vendor.store_id)

    if store_id:
        query = query.filter(models.Service.store_id == store_id)
    
    results = query.all()
    response = []
    for service, store in results:
        service_dict = {
            "service_id": service.service_id,
            "service_name": service.service_name,
            "service_desc": service.service_desc,
            "service_price": service.service_price,
            "image_url": service.image_url,
            "store_id": service.store_id,
            "status": service.status,
            "store_name": store.store_name,
            "store_type": store.store_type
        }
        response.append(service_dict)
    return response