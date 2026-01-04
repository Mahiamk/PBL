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
        # Clear others first
        current_user.last_name = None 
        current_user.initial = None

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

    # SYNC WITH CUSTOMER TABLE
    # Find customer by Email
    customer_record = db.query(models.Customer).filter(models.Customer.email == current_user.email).first()
    if customer_record:
        customer_record.customer_fname = current_user.first_name
        customer_record.customer_lname = current_user.last_name or ""
        customer_record.customer_initial = current_user.initial
        # Note: Password hash and other fields are ideally synced but this covers the name request
    
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

    # Fetch REAL counts from the database using Normalized Schema
    # Join with RoleAdmin to filter by role name
    total_vendors = db.query(User).join(models.RoleAdmin).filter(models.RoleAdmin.role_name == "vendor").count()
    total_customers = db.query(User).join(models.RoleAdmin).filter(models.RoleAdmin.role_name == "customer").count()
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

    # 1. Orders Graph - Fetched via Python to allow DB agnostic dates (SQLite/MySQL compat)
    orders = db.query(models.Order.order_date).filter(models.Order.order_date >= twelve_months_ago).all()
    
    # Process dictionaries
    daily_counts = {}
    weekly_counts = {}
    monthly_counts = {}

    for order in orders:
        dt = order.order_date
        if not dt: continue
        
        # Daily (Last 30 days only)
        if dt >= thirty_days_ago:
            d_key = dt.strftime("%Y-%m-%d")
            daily_counts[d_key] = daily_counts.get(d_key, 0) + 1
            
        # Weekly (Last 12 weeks)
        if dt >= twelve_weeks_ago:
            # ISO format year-week
            w_key = dt.strftime("%G-%V") 
            weekly_counts[w_key] = weekly_counts.get(w_key, 0) + 1
            
        # Monthly (Last 12 months)
        m_key = dt.strftime("%Y-%m")
        monthly_counts[m_key] = monthly_counts.get(m_key, 0) + 1
    
    # Sort and Format
    # Daily
    orders_graph = []
    for d in sorted(daily_counts.keys()):
         orders_graph.append({
             "name": datetime.strptime(d, "%Y-%m-%d").strftime("%b %d"),
             "value": daily_counts[d]
         })
         
    # Weekly
    orders_graph_weekly = []
    for w in sorted(weekly_counts.keys()):
        # w is YYYY-WW
        parts = w.split('-')
        label = f"Week {parts[1]}"
        orders_graph_weekly.append({"name": label, "value": weekly_counts[w]})
        
    # Monthly
    orders_data_m = [] # Placeholder variable name rewrite if needed below? 
    # Actually just replacing the query part.
    orders_graph_monthly = [] # Assuming this variable is needed
    for m in sorted(monthly_counts.keys()):
         orders_graph_monthly.append({
             "name": datetime.strptime(m, "%Y-%m").strftime("%b %Y"),
             "value": monthly_counts[m]
         })
    
    # 2. Users Graph (Vendor Applications)
    vendor_apps = db.query(models.VendorApplication.created_at).filter(models.VendorApplication.created_at >= twelve_months_ago).all()
    
    u_daily_counts = {}
    u_weekly_counts = {}
    u_monthly_counts = {}
    
    for app in vendor_apps:
        dt = app.created_at
        if not dt: continue
        
        # Daily
        if dt >= thirty_days_ago:
            d_key = dt.strftime("%Y-%m-%d")
            u_daily_counts[d_key] = u_daily_counts.get(d_key, 0) + 1
            
        # Weekly
        if dt >= twelve_weeks_ago:
            year, week, _ = dt.isocalendar()
            w_key = f"{year}-{week:02d}"
            u_weekly_counts[w_key] = u_weekly_counts.get(w_key, 0) + 1
            
        # Monthly
        m_key = dt.strftime("%Y-%m")
        u_monthly_counts[m_key] = u_monthly_counts.get(m_key, 0) + 1
        
    users_graph = []
    for d in sorted(u_daily_counts.keys()):
         users_graph.append({
             "name": datetime.strptime(d, "%Y-%m-%d").strftime("%b %d"),
             "value": u_daily_counts[d]
         })

    users_graph_weekly = []
    for w in sorted(u_weekly_counts.keys()):
        parts = w.split('-')
        label = f"Week {parts[1]}"
        users_graph_weekly.append({"name": label, "value": u_weekly_counts[w]})
        
    users_graph_monthly = []
    for m in sorted(u_monthly_counts.keys()):
         users_graph_monthly.append({
             "name": datetime.strptime(m, "%Y-%m").strftime("%b %Y"),
             "value": u_monthly_counts[m]
         })
    
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
