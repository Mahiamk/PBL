from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.models import User, UserRole, UserStatus, RoleAdmin
from app.core.security import get_password_hash

def create_admin_user():
    db = SessionLocal()
    try:
        email = "admin@pbl.com"
        password = "adminpassword"
        
        # Check if admin exists
        existing_admin = db.query(User).filter(User.email == email).first()
        if existing_admin:
            print(f"Admin user {email} already exists.")
            return

        hashed_password = get_password_hash(password)
        
        # Get Admin Role
        admin_role = db.query(RoleAdmin).filter(RoleAdmin.role_name == "admin").first()
        if not admin_role:
             print("Admin role not found in ROLE_ADMIN table.")
             return

        # 3NF Normalized: Split name into first_name, last_name, initial
        admin_user = User(
            email=email,
            hashed_password=hashed_password,
            first_name="System",
            last_name="Administrator",
            initial=None,
            role_id=admin_role.role_id,
            status=UserStatus.active
        )
        
        db.add(admin_user)
        db.commit()
        print(f"Admin user created successfully.\nEmail: {email}\nPassword: {password}")
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()