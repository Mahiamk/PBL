from app.db.database import engine
from sqlalchemy import text, inspect

def run_migration():
    with engine.connect() as connection:
        # 1. Ensure STATUS table has required statuses
        print("Checking Statuses...")
        
        required_statuses = {
            "Pending": "Order",
            "Accepted": "Order", 
            "Cancelled": "Order",
            "Completed": "Order", # Keeping for legacy
            "Processing": "Order" # Keeping for legacy
        }
        
        status_map = {} # Name -> ID
        
        for name, stype in required_statuses.items():
            existing = connection.execute(text("SELECT STATUS_ID FROM STATUS WHERE STATUS_NAME = :name AND STATUS_TYPE = :stype"), {"name": name, "stype": stype}).fetchone()
            if not existing:
                print(f"Creating status: {name}")
                connection.execute(text("INSERT INTO STATUS (STATUS_NAME, STATUS_TYPE, STATUS_DESCRIPTION) VALUES (:name, :stype, 'Auto-generated')"), {"name": name, "stype": stype})
                sid = connection.execute(text("SELECT LAST_INSERT_ID()")).scalar()
                status_map[name] = sid
            else:
                status_map[name] = existing[0]
        
        connection.commit()
        print(f"Status Map: {status_map}")
        
        # 2. Update ORDERS to set STATUS_ID based on STATUS string
        print("Migrating Order Statuses...")
        orders = connection.execute(text("SELECT ORDER_ID, STATUS FROM ORDERS")).fetchall()
        
        for order in orders:
            oid, stat_str = order
            if not stat_str: 
                continue
                
            sid = None
            s_lower = str(stat_str).lower()
            
            if s_lower in ["0", "pending", "processing"]:
                sid = status_map.get("Pending") or status_map.get("Processing")
            elif s_lower in ["1", "accepted", "confirmed"]:
                sid = status_map.get("Accepted")
            elif s_lower in ["-1", "cancelled", "rejected"]:
                sid = status_map.get("Cancelled")
            elif s_lower == "completed":
                sid = status_map.get("Completed")
            
            if sid:
                print(f"Updating Order {oid}: {stat_str} -> ID {sid}")
                connection.execute(text("UPDATE ORDERS SET STATUS_ID = :sid WHERE ORDER_ID = :oid"), {"sid": sid, "oid": oid})
            else:
                print(f"Warning: Could not map status '{stat_str}' for Order {oid}")

        connection.commit()
        
        # 3. Drop STATUS column from ORDERS
        # Check if column exists first
        inspector = inspect(engine)
        columns = [c['name'] for c in inspector.get_columns("ORDERS")]
        
        if "STATUS" in columns:
            print("Dropping STATUS column from ORDERS...")
            connection.execute(text("ALTER TABLE ORDERS DROP COLUMN STATUS"))
            connection.commit()
        else:
            print("STATUS column already dropped.")

        print("Migration complete.")

if __name__ == "__main__":
    run_migration()
