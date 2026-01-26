from typing import List, Optional
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
    service_desc: Optional[str] = None
    service_price: float
    image_url: Optional[str] = None
    store_id: int
    category_id: Optional[int] = None
    status: str = "active"

class ServiceUpdate(BaseModel):
    service_name: Optional[str] = None
    service_desc: Optional[str] = None
    service_price: Optional[float] = None
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    status: Optional[str] = None

class ServiceResponse(ServiceCreate):
    service_id: int
    store_name: Optional[str] = None
    store_type: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

@router.post("/", response_model=ServiceResponse)
def create_service(
    service: ServiceCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify store ownership & Force store_id for vendors
    if current_user.role != UserRole.ADMIN:
        vendor = db.query(models.Vendor).filter(models.Vendor.user_id == current_user.id).first()
        if not vendor:
            raise HTTPException(
                status_code=403,
                detail="Not authorized. Vendor profile not found."
            )
        
        if not vendor.store_id:
             raise HTTPException(
                status_code=403,
                detail="Vendor has no assigned store. Please contact support."
            )
            
        # FORCE the service to be created in the vendor's store
        service.store_id = vendor.store_id

    db_service = models.Service(
        service_name=service.service_name,
        service_desc=service.service_desc,
        service_price=service.service_price,
        image_url=service.image_url,
        store_id=service.store_id,
        category_id=service.category_id,
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
        .outerjoin(models.Vendor, models.Store.store_id == models.Vendor.store_id)

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
            "category_id": service.category_id,
            "store_id": service.store_id,
            "status": service.status,
            "store_name": store.store_name,
            "store_type": store.store_type
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
    db_service = db.query(models.Service).filter(models.Service.service_id == service_id).first()
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")

    # Verify ownership
    if current_user.role != UserRole.ADMIN:
        vendor = db.query(models.Vendor).filter(models.Vendor.user_id == current_user.id).first()
        if not vendor or vendor.store_id != db_service.store_id:
             raise HTTPException(status_code=403, detail="Not authorized to update this service")

    update_data = service_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_service, key, value)

    db.commit()
    db.refresh(db_service)
    
    # Re-fetch with store info for response
    return ServiceResponse(
        service_id=db_service.service_id,
        service_name=db_service.service_name,
        service_desc=db_service.service_desc,
        service_price=db_service.service_price,
        image_url=db_service.image_url,
        store_id=db_service.store_id,
        category_id=db_service.category_id,
        status=db_service.status,
        store_name=db_service.store.store_name if db_service.store else None,
        store_type=db_service.store.store_type if db_service.store else None
    )

@router.delete("/{service_id}")
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_service = db.query(models.Service).filter(models.Service.service_id == service_id).first()
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")

    # Verify ownership
    if current_user.role != UserRole.ADMIN:
        vendor = db.query(models.Vendor).filter(models.Vendor.user_id == current_user.id).first()
        if not vendor or vendor.store_id != db_service.store_id:
             raise HTTPException(status_code=403, detail="Not authorized to delete this service")

    # Check for dependencies
    # 1. Appointments
    # Retrieve associated TimeSlots first
    time_slots = db.query(models.TimeSlot).filter(models.TimeSlot.service_id == service_id).all()
    slot_ids = [ts.slot_id for ts in time_slots]
    
    if slot_ids:
        # Delete appointments associated with these slots
        # This removes them completely as requested ("remove completely")
        db.query(models.Appointment).filter(models.Appointment.slot_id.in_(slot_ids)).delete(synchronize_session=False)

    # Clean up dependencies
    # 2. StaffService (Many-to-Many link)
    db.query(models.StaffService).filter(models.StaffService.service_id == service_id).delete(synchronize_session=False)
    
    # 3. TimeSlots (Availability/Bookings)
    db.query(models.TimeSlot).filter(models.TimeSlot.service_id == service_id).delete(synchronize_session=False)

    db.delete(db_service)
    db.commit()
    return {"message": "Service deleted successfully"}