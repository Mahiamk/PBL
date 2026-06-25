from app.db.database import SessionLocal
from app.models.models import User, Vendor, UserRole
from sqlalchemy import text

def fix_vendor_roles():
    db = SessionLocal()
    try:
        print("Starting vendor role fix...")
        
        # Get all vendors
        vendors = db.query(Vendor).all()
        print(f"Found {len(vendors)} vendors in VENDOR table.")
        
        count = 0
        for vendor in vendors:
            if vendor.user_id:
                user = db.query(User).filter(User.id == vendor.user_id).first()
                if user:
                    if user.role != UserRole.VENDOR:
                        print(f"Updating User {user.id} ({user.email}) to VENDOR role (was {user.role})")
                        # We use the STRING value 'vendor' because of the Enum handling we fixed earlier
                        # But SQLAlchemy ORM should handle the Enum object if mapped correctly.
                        # Since we fixed the mapping to use values, we should pass the Enum member or value.
                        # Let's use the value to be safe given the previous trouble.
                        user.role = UserRole.VENDOR
                        count += 1
                else:
                    print(f"Warning: Vendor {vendor.vendor_id} has user_id {vendor.user_id} but User not found.")
            else:
                print(f"Warning: Vendor {vendor.vendor_id} has no user_id.")
        
        db.commit()
        print(f"Successfully updated {count} users to VENDOR role.")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_vendor_roles()
