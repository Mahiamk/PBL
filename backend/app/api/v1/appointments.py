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
    # Update for Normalized Schema: Join Staff and TimeSlot
    existing_appointment = db.query(models.Appointment).join(models.Appointment.staff).join(models.Appointment.time_slot).filter(
        models.Appointment.store_id == appointment.store_id,
        models.Staff.staff_name == appointment.barber_name,
        models.TimeSlot.start_time == appointment.booking_date,
        models.Appointment.status != "Cancelled",
        models.Appointment.status != "-1"
    ).first()

    if existing_appointment:
        raise HTTPException(status_code=400, detail="This time slot is already booked for this barber.")

    # --- NORMALIZATION LOGIC ---
    # 1. Find or Create Staff
    # Staff is linked to Vendor, and Vendor is linked to Store.
    staff = db.query(models.Staff).join(models.Vendor).filter(
        models.Staff.staff_name == appointment.barber_name,
        models.Vendor.store_id == appointment.store_id
    ).first()
    
    if not staff:
        # Find the vendor for this store to link the staff
        vendor = db.query(models.Vendor).filter(models.Vendor.store_id == appointment.store_id).first()
        
        # If no vendor profile exists for this store, we might need to handle it. 
        # For now, we proceed, but staff might be unlinked if vendor is None.
        staff = models.Staff(
            staff_name=appointment.barber_name,
            vendor_id=vendor.vendor_id if vendor else None
            # Removed invalid fields: store_id, role
        )
        db.add(staff)
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
        staff_id=staff.staff_id,
        slot_id=new_slot.slot_id,
        status="0", # Pending
        # Populating legacy columns so they appear in raw SQL queries
        legacy_barber_name=appointment.barber_name,
        legacy_service_name=appointment.service_name,
        legacy_booking_date=appointment.booking_date
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
    
    is_late_cancellation = False
    warning_msg = None

    if time_diff < timedelta(hours=24):
        is_late_cancellation = True
        warning_msg = "Cannot cancel appointment within 24 hours due to penalty policy."
        
    # Proceed to cancel regardless of time
    appointment.status = "-1" # Cancelled
    
    # Notify Vendor
    vendor = db.query(models.Vendor).filter(models.Vendor.store_id == appointment.store_id).first()
    if vendor and vendor.user_id:
        msg = f"Customer {current_user.full_name or 'Guest'} successfully cancelled appointment #{appointment_id}."
        if is_late_cancellation:
            msg += " (LATE CANCELLATION: Within 24h Penalty Applied)"
            
        notif = models.Notification(
            user_id=vendor.user_id,
            title="Appointment Cancelled",
            message=msg,
            type="appointment",
            related_id=appointment.appointment_id,
        )
        db.add(notif)
    
    db.commit()
    db.refresh(appointment)
    
    if is_late_cancellation:
        raise HTTPException(status_code=400, detail=warning_msg)

    return appointment

@router.get("/my-appointments", response_model=list[Appointment])
def get_my_appointments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Appointment).filter(models.Appointment.customer_id == current_user.id).all()

@router.get("/store/{store_id}", response_model=list[Appointment])
def get_store_appointments(store_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Appointment).filter(models.Appointment.store_id == store_id).all()
