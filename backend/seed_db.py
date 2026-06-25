from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash

def seed():
    db = SessionLocal()
    # Check if user already exists
    if db.query(User).filter(User.email == "admin@example.com").first():
        print("User already exists.")
        return

    # 3NF Normalized: Split name into first_name, last_name, initial
    admin_user = User(
        first_name="Admin",
        last_name="User",
        initial=None,
        email="admin@example.com",
        hashed_password=get_password_hash("password123"),
        role=UserRole.ADMIN,
        status="active"  # is_active is now computed from status
    )
    db.add(admin_user)
    db.commit()
    print("Admin user created successfully!")

if __name__ == "__main__":
    seed()