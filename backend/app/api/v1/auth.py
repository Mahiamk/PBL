from datetime import timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import text
from sqlalchemy.orm import Session
import shutil
import uuid
from pathlib import Path

from app.schemas.auth import Token, UserCreate, UserResponse, VendorRegister
from app.core.security import create_access_token, verify_password, get_password_hash
from app.db.database import get_db
from app.models import models
from app.models.models import User, UserRole, UserStatus, VendorApplication, Store, Vendor, SystemLog, RoleAdmin, Customer

router = APIRouter()
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if phone number is unique (if provided)
    if user.phone_number:
        db_phone = db.query(User).filter(User.phone_number == user.phone_number).first()
        if db_phone:
            raise HTTPException(status_code=400, detail="Phone number already in use")

    # Hash the password
    hashed_password = get_password_hash(user.password)
    
    # Get Customer Role ID
    customer_role = db.query(RoleAdmin).filter(RoleAdmin.role_name == "customer").first()
    if not customer_role:
        # Fallback if migration missed seeding, or handle error. 
        # Ideally should error, but for robustness might fallback or creating generic role?
        # Assuming seed ran.
        raise HTTPException(status_code=500, detail="Customer role not configured in system.")

    # Create new user (Customer is ACTIVE by default) - 3NF normalized name fields
    new_user = User(
        email=user.email,
        hashed_password=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        initial=user.initial,
        phone_number=user.phone_number,
        role_id=customer_role.role_id,
        status=UserStatus.active
    )
    
    db.add(new_user)
    db.flush() # flush to get User ID if needed, but we need to commit to satisfy foreign keys for Customer table if linked? 
               # Customer table doesn't have FK to User table directly, but maps fields.

    # Also create record in CUSTOMER table
    new_customer = Customer(
        customer_fname=user.first_name,
        customer_lname=user.last_name,
        customer_initial=user.initial,
        customer_num=user.phone_number,
        email=user.email,
        password_hash=hashed_password,
        role_id=customer_role.role_id
    )
    db.add(new_customer)
    
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/register/vendor", response_model=UserResponse)
def register_vendor(
    first_name: str = Form(...),
    last_name: str = Form(...),
    initial: Optional[str] = Form(None),
    phone_number: Optional[str] = Form(None),
    email: str = Form(...),
    password: str = Form(...),
    business_name: str = Form(...),
    contact_details: str = Form(...),
    vendor_type: str = Form(...),
    banner_image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # Check if user already exists
    db_user = db.query(User).filter(User.email == email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if phone number is unique (if provided)
    if phone_number:
        db_phone = db.query(User).filter(User.phone_number == phone_number).first()
        if db_phone:
            raise HTTPException(status_code=400, detail="Phone number already in use")

    hashed_password = get_password_hash(password)
    
    # Handle Image Upload
    image_url = None
    if banner_image:
        try:
            # Generate unique filename
            file_extension = banner_image.filename.split(".")[-1] if "." in banner_image.filename else "jpg"
            file_name = f"{uuid.uuid4()}.{file_extension}"
            file_path = UPLOAD_DIR / file_name
            
            with file_path.open("wb") as buffer:
                shutil.copyfileobj(banner_image.file, buffer)
            
            # Store relative path or URL
            image_url = f"/uploads/{file_name}"
        except Exception as e:
            print(f"Failed to upload banner image: {e}")
            # Continue without image (will use default)

    # Compute full name for backward compatibility
    full_name = " ".join(filter(None, [first_name, initial, last_name]))
    
    # Get Vendor Role ID
    vendor_role = db.query(RoleAdmin).filter(RoleAdmin.role_name == "vendor").first()
    if not vendor_role:
        raise HTTPException(status_code=500, detail="Vendor role not configured in system.")

    # Create new user (Vendor is ACTIVE for dev/demo purposes) - 3NF normalized name fields
    new_user = User(
        email=email,
        hashed_password=hashed_password,
        first_name=first_name,
        last_name=last_name,
        initial=initial,
        phone_number=phone_number,
        role_id=vendor_role.role_id,
        status=UserStatus.PENDING
    )
    
    db.add(new_user)
    db.flush() # Get ID without committing
    
    # Create Store automatically
    new_store = Store(
        store_name=business_name,
        store_type=vendor_type,
        image_url=image_url # Set the uploaded image URL (or None)
    )
    db.add(new_store)
    db.flush() # Get Store ID

    # Create Vendor Profile linking User and Store
    new_vendor_profile = Vendor(
        vendor_name=full_name,
        user_id=new_user.id,
        store_id=new_store.store_id
    )
    db.add(new_vendor_profile)
    
    # Create Vendor Application (Marked as pending)
    application = VendorApplication(
        user_id=new_user.id,
        business_name=business_name,
        contact_details=contact_details,
        status="pending",
        vendor_type=vendor_type
    )
    db.add(application)
    
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    # Find the user using the ORM User model (by email or first_name)
    # Note: first_name used instead of full_name for login (3NF normalized)
    user = (
        db.query(User)
        .filter((User.email == form_data.username) | (User.first_name == form_data.username))
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(form_data.password, user.hashed_password):
        # Log Login Failure
        is_vendor = UserRole.VENDOR == user.role or "vendor" in str(user.role).lower()
        fail_log = SystemLog(
            action="Login Failure",
            # order_id removed
            customer_id=user.id if not is_vendor else None,
            vendor_id=user.id if is_vendor else None
        )
        db.add(fail_log)
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        

    # Vendor application status check
    if user.role == UserRole.VENDOR:
        # Check vendor application status
        vendor_app = db.query(VendorApplication).filter(VendorApplication.user_id == user.id).first()
        if vendor_app:
            if vendor_app.status.lower() == "rejected":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Your vendor application has been rejected. You cannot log in as a vendor.",
                )
            elif vendor_app.status.lower() != "active":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Your vendor application is under review. Please wait for admin approval.",
                )
        elif user.status == UserStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your vendor account is pending approval.",
            )
        elif user.status == UserStatus.REJECTED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been suspended or rejected.",
            )
    else:
        if user.status == UserStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account is pending approval.",
            )
        if user.status == UserStatus.REJECTED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been suspended or rejected.",
            )

    # Determine role string from Enum
    role = (user.role.value if hasattr(user.role, "value") else str(user.role)).lower()

    # Get store_id from vendor_profile relationship if present, fallback to VENDOR table lookup
    store_id = None
    vendor_type = None # Initialize vendor_type

    if "vendor" in role:
        # Robust fetch: Query Vendor table explicitly
        # We need to import models here or rely on existing imports. 
        # Assuming `from app.models.models import ...` is available or `db` context works.
        # Since this function uses `db: Session`, we can use `db.query(Vendor)`.
        # We need to ensure Vendor is imported or available via models.Vendor
        from app.models import models

        vendor_record = db.query(models.Vendor).filter(models.Vendor.user_id == user.id).first()
        
        if vendor_record:
            store_id = vendor_record.store_id
            # Get vendor_type from the associated Store
            if vendor_record.store:
                vendor_type = vendor_record.store.store_type
            else:
                # If relationship not loaded, fetch manually
                store_rec = db.query(models.Store).filter(models.Store.store_id == store_id).first()
                if store_rec:
                    vendor_type = store_rec.store_type
        
        # Fallback logic (legacy)
        if not store_id:
            try:
                vendor_row = db.execute(
                    text("SELECT STORE_ID FROM VENDOR WHERE VENDOR_NAME = :name LIMIT 1"),
                    {"name": user.full_name or user.email},
                ).fetchone()
                if vendor_row:
                    store_id = vendor_row[0] 
            except Exception:
                pass 

    access_token_expires = timedelta(minutes=30)
    # FIX: Pass only user.email as the subject, not the whole dict
    access_token = create_access_token(
        subject=user.email,
        expires_delta=access_token_expires,
    )

    # Log Login Success
    is_vendor = UserRole.VENDOR == user.role or "vendor" in role
    success_log = SystemLog(
        action="Login Success",
        customer_id=user.id if not is_vendor else None,
        vendor_id=user.id if is_vendor else None
    )
    db.add(success_log)
    db.commit()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": role,
        "user_id": user.id,
        "store_id": store_id,
        "vendor_type": vendor_type, # Return vendor_type
        "profile_image": user.profile_image, # Return profile_image
        "full_name": user.full_name,
        "email": user.email
    }
