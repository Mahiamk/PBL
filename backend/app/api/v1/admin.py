from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models import models
from app.schemas.auth import UserResponse, VendorApplicationResponse
from app.api.deps import get_current_user
from app.models.models import UserRole, UserStatus

router = APIRouter()

def check_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_admin)
):
    users = db.query(models.User).all()
    response = []
    for user in users:
        vendor_type = None
        if user.role == UserRole.VENDOR:
            # Try to get type from vendor profile -> store
            if user.vendor_profile and user.vendor_profile.store:
                vendor_type = user.vendor_profile.store.store_type
            # Fallback: Try to get from vendor application if store not created yet
            elif user.vendor_application:
                vendor_type = user.vendor_application.vendor_type
        
        # 3NF Normalized: Use first_name, last_name, initial (full_name is computed property)
        user_data = {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "initial": user.initial,
            "full_name": user.full_name,  # Computed property for backward compatibility
            "role": user.role,
            "status": user.status,
            "is_active": user.is_active,  # Computed property from status
            "vendor_type": vendor_type
        }
        response.append(user_data)
        
    return response

@router.get("/vendor-applications", response_model=List[VendorApplicationResponse])
def get_vendor_applications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_admin)
):
    return db.query(models.VendorApplication).all()

@router.put("/vendor-applications/{application_id}/approve")
def approve_vendor(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_admin)
):
    application = db.query(models.VendorApplication).filter(models.VendorApplication.application_id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
        
    user = db.query(models.User).filter(models.User.id == application.user_id).first()
    
    # Update statuses - using explicit strings to match the String column type
    application.status = "active"
    user.status = "active"
    
    # Create actual Vendor record if not exists
    existing_vendor = db.query(models.Vendor).filter(models.Vendor.user_id == user.id).first()
    if not existing_vendor:
        # Create Store first
        new_store = models.Store(
            store_name=application.business_name,
            store_type=application.vendor_type
        )
        db.add(new_store)
        db.flush() # Get store_id

        new_vendor = models.Vendor(
            vendor_name=application.business_name,
            user_id=user.id,
            store_id=new_store.store_id
        )
        db.add(new_vendor)
    
    db.commit()
    return {"message": "Vendor approved successfully"}

@router.put("/vendor-applications/{application_id}/reject")
def reject_vendor(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_admin)
):
    application = db.query(models.VendorApplication).filter(models.VendorApplication.application_id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
        
    user = db.query(models.User).filter(models.User.id == application.user_id).first()
    
    # Update statuses - using explicit strings
    application.status = "rejected"
    user.status = "rejected"

    # Mark all products of this vendor as unavailable
    vendor = db.query(models.Vendor).filter(models.Vendor.user_id == user.id).first()
    if vendor and vendor.store_id:
        products = db.query(models.Product).filter(models.Product.store_id == vendor.store_id).all()
        for product in products:
            product.status = "unavailable"

    db.commit()
    return {"message": "Vendor application rejected and all products marked as unavailable."}

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_admin)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent deleting self
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")

    # Handle Vendor-specific logic
    if user.role == UserRole.VENDOR:
        vendor_profile = db.query(models.Vendor).filter(models.Vendor.user_id == user.id).first()
        if vendor_profile and vendor_profile.store_id:
            store_id = vendor_profile.store_id
            
            # Check for active orders before deletion
            pending_statuses = ["Processing", "Pending", "Confirmed", "active"]
            active_orders_count = db.query(models.Order).filter(
                models.Order.store_id == store_id,
                models.Order.status.in_(pending_statuses)
            ).count()
            
            if active_orders_count > 0:
                raise HTTPException(
                    status_code=400, 
                    detail="Cannot delete vendor account. There are active or pending orders associated with this shop."
                )

            # 1. Delete Order Items and History first (Dependencies)
            # Fetch all orders (even completed/cancelled ones) to clean up items/history
            orders = db.query(models.Order).filter(models.Order.store_id == store_id).all()
            for order in orders:
                db.query(models.OrderItem).filter(models.OrderItem.order_id == order.order_id).delete()
                db.query(models.OrderHistory).filter(models.OrderHistory.order_id == order.order_id).delete()
            
            # 2. Delete Orders
            db.query(models.Order).filter(models.Order.store_id == store_id).delete()

            # 3. Delete Product Images and Products
            products = db.query(models.Product).filter(models.Product.store_id == store_id).all()
            for product in products:
                db.query(models.ProductImage).filter(models.ProductImage.product_id == product.product_id).delete()
            
            db.query(models.Product).filter(models.Product.store_id == store_id).delete()

            # 4. Delete Service Related (TimeSlots, Services)
            services = db.query(models.Service).filter(models.Service.store_id == store_id).all()
            for service in services:
                db.query(models.TimeSlot).filter(models.TimeSlot.service_id == service.service_id).delete()
            
            db.query(models.Service).filter(models.Service.store_id == store_id).delete()

            # 5. Delete Provider, Appointments, Reviews, Categories
            db.query(models.Appointment).filter(models.Appointment.store_id == store_id).delete()
            db.query(models.ServiceProvider).filter(models.ServiceProvider.store_id == store_id).delete()
            db.query(models.Review).filter(models.Review.store_id == store_id).delete()
            db.query(models.Category).filter(models.Category.store_id == store_id).delete()
            
            # 6. Delete Vendor Profile linked to Store
            db.delete(vendor_profile)
            db.flush() # Ensure vendor is deleted before store to satisfy Foreign Key constraint
            
            # 7. Delete Store
            db.query(models.Store).filter(models.Store.store_id == store_id).delete()
        elif vendor_profile:
            # Vendor has profile but no store
            db.delete(vendor_profile)

    # Delete Customer Profile if exists (Sync with User table)
    customer = db.query(models.Customer).filter(models.Customer.email == user.email).first()
    if customer:
        # Delete related data for customer to ensure clean removal
        db.query(models.Review).filter(models.Review.customer_id == customer.customer_id).delete()
        # Note: We mostly keep Orders/Appointments for business records, but if required, we could delete them too.
        # For now, we just remove the identity records.
        db.delete(customer)

    # Delete Vendor Application
    db.query(models.VendorApplication).filter(models.VendorApplication.user_id == user.id).delete()

    # Hard Delete User
    db.delete(user)

    db.commit()
    return {"message": "User, Shop, and all related data deleted permanently"}

@router.get("/system-logs/stats")
def get_system_log_stats(
    period: str = "week",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_admin)
):
    from datetime import datetime, timedelta
    
    now = datetime.now()
    if period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    else:
        start_date = now - timedelta(days=7) 
        
    logs = db.query(models.SystemLog).filter(models.SystemLog.timestamp >= start_date).all()
    
    success_count = sum(1 for log in logs if "Success" in log.action)
    failure_count = sum(1 for log in logs if "Failure" in log.action)
    
    return {
        "period": period,
        "success_count": success_count,
        "failure_count": failure_count,
        "total_logs": len(logs)
    }
