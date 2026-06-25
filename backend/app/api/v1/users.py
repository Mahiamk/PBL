from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from sqlalchemy.orm import Session
import shutil
import uuid
from pathlib import Path
from typing import Optional

from app.schemas.schemas import (
    AdminDashboardData, VendorDashboardData, CustomerDashboardData, Store, Customer
)
from app.schemas.auth import UserResponse
from app.db.database import get_db
from app.models import models
from app.api.deps import get_current_user
from app.models.models import User, UserRole
from sqlalchemy import text

router = APIRouter()
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=Customer)
def update_user_profile(
    name: str = Form(...),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Update Name - parse into first_name and last_name (3NF normalized)
    name_parts = name.strip().split()
    if name_parts:
        current_user.first_name = name_parts[0]
        if len(name_parts) > 1:
            current_user.last_name = name_parts[-1]
            if len(name_parts) > 2:
                # Middle parts become the initial
                current_user.initial = " ".join(name_parts[1:-1])
    
    # Handle Photo Upload
    if photo:
        try:
            file_extension = photo.filename.split(".")[-1] if "." in photo.filename else "jpg"
            file_name = f"profile_{current_user.id}_{uuid.uuid4()}.{file_extension}"
            file_path = UPLOAD_DIR / file_name
            
            with file_path.open("wb") as buffer:
                shutil.copyfileobj(photo.file, buffer)
            
            current_user.profile_image = f"/uploads/{file_name}"
        except Exception as e:
            print(f"Failed to upload profile image: {e}")
            raise HTTPException(status_code=500, detail="Failed to upload image")

    db.commit()
    db.refresh(current_user)
    
    return Customer(
        customer_id=current_user.id,
        customer_name=current_user.full_name,  # Uses computed property
        email=current_user.email,
        profile_image=current_user.profile_image
    )

# Admin Dashboard
@router.get("/admin/dashboard", response_model=AdminDashboardData)
def get_admin_dashboard(db: Session = Depends(get_db)):
    from sqlalchemy import func
    from datetime import datetime, timedelta

    # Fetch REAL counts from the database
    total_vendors = db.query(User).filter(User.role == UserRole.VENDOR).count()
    total_customers = db.query(User).filter(User.role == UserRole.CUSTOMER).count()
    total_orders = db.query(models.Order).count()
    
    # Graphs: Multi-range
    thirty_days_ago = datetime.now() - timedelta(days=30)
    twelve_weeks_ago = datetime.now() - timedelta(weeks=12)
    twelve_months_ago = datetime.now() - timedelta(days=365)
    
    def format_date_val(val, fmt="%b %d"):
        # Handle string or date object
        if val is None: return ""
        if isinstance(val, str):
            try:
                # Try simple date format
                return datetime.strptime(val, "%Y-%m-%d").strftime(fmt)
            except:
                return val
        if hasattr(val, 'strftime'):
            return val.strftime(fmt)
        return str(val)

    # 1. Orders Graph
    # Daily
    orders_data = db.query(
        func.date(models.Order.order_date).label('date'),
        func.count(models.Order.order_id).label('count')
    ).filter(models.Order.order_date >= thirty_days_ago)\
     .group_by('date')\
     .order_by('date').all()
     
    orders_graph = [
        {"name": format_date_val(d.date), "value": d.count} 
        for d in orders_data
    ]
    
    # Weekly
    orders_data_w = db.query(
        func.date_format(models.Order.order_date, '%Y-%u').label('week'),
        func.count(models.Order.order_id).label('count')
    ).filter(models.Order.order_date >= twelve_weeks_ago)\
     .group_by('week')\
     .order_by('week').all()
     
    orders_graph_weekly = []
    for d in orders_data_w:
        label = d.week # e.g. 2023-45
        if d.week and '-' in d.week:
             label = f"Week {d.week.split('-')[1]}"
        orders_graph_weekly.append({"name": label, "value": d.count})

    # Monthly
    orders_data_m = db.query(
        func.date_format(models.Order.order_date, '%Y-%m').label('month'),
        func.count(models.Order.order_id).label('count')
    ).filter(models.Order.order_date >= twelve_months_ago)\
     .group_by('month')\
     .order_by('month').all()
    
    orders_graph_monthly = []
    for d in orders_data_m:
         label = d.month
         if d.month:
             try:
                 label = datetime.strptime(d.month, "%Y-%m").strftime("%b %Y")
             except: pass
         orders_graph_monthly.append({"name": label, "value": d.count})

    # 2. Users Graph (Vendor Applications)
    # Daily
    vendors_data = db.query(
        func.date(models.VendorApplication.created_at).label('date'),
        func.count(models.VendorApplication.application_id).label('count')
    ).filter(models.VendorApplication.created_at >= thirty_days_ago)\
     .group_by('date')\
     .order_by('date').all()
     
    users_graph = [
        {"name": format_date_val(d.date), "value": d.count}
        for d in vendors_data
    ]
    
    # Weekly
    vendors_data_w = db.query(
        func.date_format(models.VendorApplication.created_at, '%Y-%u').label('week'),
        func.count(models.VendorApplication.application_id).label('count')
    ).filter(models.VendorApplication.created_at >= twelve_weeks_ago)\
     .group_by('week')\
     .order_by('week').all()
     
    users_graph_weekly = []
    for d in vendors_data_w:
        label = d.week
        if d.week and '-' in d.week:
             label = f"Week {d.week.split('-')[1]}"
        users_graph_weekly.append({"name": label, "value": d.count})
        
    # Monthly
    vendors_data_m = db.query(
        func.date_format(models.VendorApplication.created_at, '%Y-%m').label('month'),
        func.count(models.VendorApplication.application_id).label('count')
    ).filter(models.VendorApplication.created_at >= twelve_months_ago)\
     .group_by('month')\
     .order_by('month').all()
     
    users_graph_monthly = []
    for d in vendors_data_m:
         label = d.month
         if d.month:
             try:
                 label = datetime.strptime(d.month, "%Y-%m").strftime("%b %Y")
             except: pass
         users_graph_monthly.append({"name": label, "value": d.count})
    
    return AdminDashboardData(
        total_vendors=total_vendors,
        total_customers=total_customers,
        total_orders=total_orders,
        recent_logs=[],
        orders_graph=orders_graph,
        users_graph=users_graph,
        orders_graph_weekly=orders_graph_weekly,
        orders_graph_monthly=orders_graph_monthly,
        users_graph_weekly=users_graph_weekly,
        users_graph_monthly=users_graph_monthly
    )

# Vendor Dashboard
@router.get("/vendor/dashboard/{user_id}", response_model=VendorDashboardData)
def get_vendor_dashboard(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # Add dependency
):
    # Security Check: Ensure user is accessing their own dashboard
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this dashboard"
        )

    # Find the Vendor record associated with this User ID
    vendor = db.query(models.Vendor).filter(models.Vendor.user_id == user_id).first()
    
    if not vendor:
        # Fallback: Check if the ID passed is actually a store_id (legacy support)
        store = db.query(models.Store).filter(models.Store.store_id == user_id).first()
        if store:
            store_id = store.store_id
        else:
            raise HTTPException(status_code=404, detail="Vendor profile not found for this user")
    else:
        store_id = vendor.store_id

    if not store_id:
         raise HTTPException(status_code=404, detail="Store not associated with this vendor")
        
    store = db.query(models.Store).filter(models.Store.store_id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    products = db.query(models.Product).filter(
        models.Product.store_id == store_id,
        models.Product.status != "deleted"
    ).all()
    orders = db.query(models.Order).filter(models.Order.store_id == store_id).order_by(models.Order.order_date.desc()).all()
    
    # Extract unique customers from orders
    customers_map = {}
    for order in orders:
        c_id = order.customer_id
        if c_id not in customers_map:
            customers_map[c_id] = {
                "customer_id": c_id,
                "customer_name": order.customer_name or "Guest",
                "email": "N/A", # Email not available in Order model
                "created_at": order.order_date,
                "status": "active"
            }
        else:
            # Since orders are sorted DESC, later iterations are older orders.
            # Update created_at to the older date to represent "first seen"
            customers_map[c_id]["created_at"] = order.order_date

    customers = [Customer(**c) for c in customers_map.values()]

    return VendorDashboardData(
        store_info=store,
        products=products,
        recent_orders=orders,
        appointments=[], # Appointments not implemented in DB yet
        customers=customers
    )

# Customer Dashboard
@router.get("/customer/dashboard/{customer_id}", response_model=CustomerDashboardData)
def get_customer_dashboard(
    customer_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Security check: Ensure user is accessing their own dashboard
    if current_user.id != customer_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this dashboard"
        )

    orders = db.query(models.Order).filter(models.Order.customer_id == customer_id).order_by(models.Order.order_date.desc()).all()
    stores = db.query(models.Store).all()
    
    # Map store_id to vendor user_id AND store_name
    vendors = db.query(models.Vendor).all()
    stores_list = db.query(models.Store).all()
    
    store_vendor_map = {v.store_id: v.user_id for v in vendors if v.store_id}
    store_name_map = {s.store_id: s.store_name for s in stores_list}
    
    for order in orders:
        order.vendor_user_id = store_vendor_map.get(order.store_id)
        order.store_name = store_name_map.get(order.store_id)
    
    # Mock customer profile
    customer_profile = Customer(
        customer_id=customer_id,
        customer_name=current_user.full_name, # Use real name from token
        email=current_user.email,             # Use real email from token
        customer_num=str(current_user.id),
        profile_image=current_user.profile_image # Return real profile image from DB
    )

    return CustomerDashboardData(
        profile=customer_profile,
        active_orders=orders,
        upcoming_appointments=[],
        available_stores=stores
    )
