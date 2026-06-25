from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.schemas import Appointment, AppointmentCreate
from pydantic import BaseModel
from app.models import models
from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.models import User
from datetime import datetime, timedelta, timezone

router = APIRouter()

@router.post("/", response_model=Appointment)
def create_appointment(appointment: AppointmentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check for existing appointment with the same barber at the same time
    # Update for Normalized Schema: Join Provider and TimeSlot
    existing_appointment = db.query(models.Appointment).join(models.Appointment.provider).join(models.Appointment.time_slot).filter(
        models.Appointment.store_id == appointment.store_id,
        models.ServiceProvider.name == appointment.barber_name,
        models.TimeSlot.start_time == appointment.booking_date,
        models.Appointment.status != "Cancelled"
    ).first()

    if existing_appointment:
        raise HTTPException(status_code=400, detail="This time slot is already booked for this barber.")

    # --- NORMALIZATION LOGIC ---
    # 1. Find or Create Service Provider
    provider = db.query(models.ServiceProvider).filter(
        models.ServiceProvider.name == appointment.barber_name,
        models.ServiceProvider.store_id == appointment.store_id
    ).first()
    
    if not provider:
        provider = models.ServiceProvider(
            name=appointment.barber_name,
            store_id=appointment.store_id
        )
        db.add(provider)
        db.flush()

    # 2. Find Service
    service = db.query(models.Service).filter(
        models.Service.service_name == appointment.service_name,
        models.Service.store_id == appointment.store_id
    ).first()
    
    if not service:
        # Fallback search by name only
        service = db.query(models.Service).filter(models.Service.service_name == appointment.service_name).first()
        
    if not service:
        raise HTTPException(status_code=400, detail=f"Service '{appointment.service_name}' not found")

    # 3. Create TimeSlot
    # For now, we create a new slot for every confirmed booking. 
    # In a real scheduling system, we might pick from available slots.
    end_time = appointment.booking_date + timedelta(hours=1) # Default 1 hr duration
    new_slot = models.TimeSlot(
        start_time=appointment.booking_date,
        end_time=end_time,
        service_id=service.service_id
    )
    db.add(new_slot)
    db.flush()

    db_appointment = models.Appointment(
        customer_id=current_user.id,
        customer_name=(current_user.full_name or current_user.email or "Unknown"),
        store_id=appointment.store_id,
        provider_id=provider.provider_id,
        slot_id=new_slot.slot_id,
        status="Pending"
    )
    
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)

    # --- NOTIFICATION LOGIC ---
    # Find vendor
    vendor = db.query(models.Vendor).filter(models.Vendor.store_id == appointment.store_id).first()
    if vendor and vendor.user_id:
        notif = models.Notification(
            user_id=vendor.user_id,
            title="New Appointment Booked",
            message=f"New appointment with {appointment.barber_name} for {appointment.service_name} on {appointment.booking_date.strftime('%Y-%m-%d %H:%M')}.",
            type="appointment",
            related_id=db_appointment.appointment_id,
        )
        db.add(notif)
        db.commit()

    return db_appointment

class AppointmentStatusUpdate(BaseModel):
    status: str

@router.put("/{appointment_id}/status", response_model=Appointment)
def update_appointment_status(
    appointment_id: int, 
    status_update: AppointmentStatusUpdate,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    print(f"DEBUG: Status Update Request for Appt {appointment_id} by User {current_user.id} ({current_user.role})")
    appointment = db.query(models.Appointment).filter(models.Appointment.appointment_id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    print(f"DEBUG: Appointment Store ID: {appointment.store_id}")

    # Authorization: Ensure user is the vendor owning the store or Admin
    if current_user.role != "admin":
        vendor = db.query(models.Vendor).filter(models.Vendor.user_id == current_user.id).first()
        if vendor:
            print(f"DEBUG: Found Vendor profile. Vendor Store ID: {vendor.store_id}")
        else:
            print("DEBUG: No Vendor profile found for this user.")

        if not vendor or vendor.store_id != appointment.store_id:
             print("DEBUG: Authorization Failed")
             raise HTTPException(status_code=403, detail="Not authorized to manage this appointment")

    
    appointment.status = status_update.status
    db.commit()
    db.refresh(appointment)
    
    return appointment

@router.put("/{appointment_id}/cancel", response_model=Appointment)
def cancel_appointment(appointment_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    appointment = db.query(models.Appointment).filter(models.Appointment.appointment_id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if appointment.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this appointment")
        
    # Check 24h rule
    # Assuming booking_date is timezone aware or naive UTC. 
    # models.py says DateTime(timezone=True).
    
    now = datetime.now(timezone.utc)
    # Ensure appointment.booking_date is aware
    appt_date = appointment.booking_date
    if appt_date.tzinfo is None:
        appt_date = appt_date.replace(tzinfo=timezone.utc)
        
    time_diff = appt_date - now
    
    if time_diff < timedelta(hours=24):
        raise HTTPException(status_code=400, detail="Cannot cancel appointments with less than 24 hours notice due to penalty policy.")
        
    appointment.status = "Cancelled"
    db.commit()
    db.refresh(appointment)
    return appointment

@router.get("/my-appointments", response_model=list[Appointment])
def get_my_appointments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Appointment).filter(models.Appointment.customer_id == current_user.id).all()

@router.get("/store/{store_id}", response_model=list[Appointment])
def get_store_appointments(store_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Appointment).filter(models.Appointment.store_id == store_id).all()
