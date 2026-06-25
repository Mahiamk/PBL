import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SQLALCHEMY_DATABASE_URL
from app.models import models

def migrate():
    print("Starting 3NF Normalization Migration...")
    
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    # 1. Create new tables (PaymentMethod, OrderHistory) and new columns (Order.payment_method_id)
    # SQLAlchemy create_all checks for existence, so it will add new tables.
    # BUT it won't add new columns to existing tables automatically unless using Alembic.
    # So we must add the column manually via SQL if it doesn't exist.
    
    print("Creating tables...")
    models.Base.metadata.create_all(bind=engine)
    
    with engine.connect() as conn:
        # Check if PAYMENT_METHOD_ID column exists
        try:
            result = conn.execute(text("SHOW COLUMNS FROM ORDERS LIKE 'PAYMENT_METHOD_ID'"))
            if not result.fetchone():
                print("Adding PAYMENT_METHOD_ID column to ORDERS...")
                conn.execute(text("ALTER TABLE ORDERS ADD COLUMN PAYMENT_METHOD_ID Integer"))
                conn.execute(text("ALTER TABLE ORDERS ADD CONSTRAINT fk_payment_method FOREIGN KEY (PAYMENT_METHOD_ID) REFERENCES PAYMENT_METHOD(payment_method_id)"))
                conn.commit()
        except Exception as e:
            print(f"Column check warning: {e}")

        # 2. Extract Payment Methods
        print("Extracting Payment Methods...")
        # Check if old column exists
        has_old_col = False
        result = conn.execute(text("SHOW COLUMNS FROM ORDERS LIKE 'PAYMENT_METHOD'"))
        if result.fetchone():
            has_old_col = True
            
        if has_old_col:
            result = conn.execute(text("SELECT DISTINCT PAYMENT_METHOD FROM ORDERS WHERE PAYMENT_METHOD IS NOT NULL"))
            methods = [row[0] for row in result]
            
            for m in methods:
                if not m: continue
                # Check exist
                exists = conn.execute(text("SELECT payment_method_id FROM PAYMENT_METHOD WHERE method_name = :m"), {"m": m}).fetchone()
                if not exists:
                    print(f"Creating PaymentMethod: {m}")
                    conn.execute(text("INSERT INTO PAYMENT_METHOD (method_name, description) VALUES (:m, 'Imported')"), {"m": m})
            conn.commit()
            
            # 3. Migrate Data
            print("Migrating Order Data...")
            pm_rows = conn.execute(text("SELECT payment_method_id, method_name FROM PAYMENT_METHOD")).fetchall()
            for pid, name in pm_rows:
                conn.execute(text("UPDATE ORDERS SET PAYMENT_METHOD_ID = :pid WHERE PAYMENT_METHOD = :name"), {"pid": pid, "name": name})
            conn.commit()
        
        # 4. Populate History
        print("Populating Order History...")
        # Check if already populated to avoid dupes?
        # Just simple check: if no history for order, insert.
        conn.execute(text("""
            INSERT INTO ORDER_HISTORY (order_id, status, comment, created_at)
            SELECT o.ORDER_ID, o.STATUS, 'Migration Snapshot', NOW()
            FROM ORDERS o
            LEFT JOIN ORDER_HISTORY h ON o.ORDER_ID = h.order_id
            WHERE h.history_id IS NULL
        """))
        conn.commit()
        
        # 5. Drop Legacy Column
        # Only if all IDs are set?
        if has_old_col:
            # Verify no nulls in ID where Method was not null
            check = conn.execute(text("SELECT COUNT(*) FROM ORDERS WHERE PAYMENT_METHOD_ID IS NULL AND PAYMENT_METHOD IS NOT NULL")).scalar()
            if check == 0:
                print("Dropping legacy PAYMENT_METHOD column...")
                conn.execute(text("ALTER TABLE ORDERS DROP COLUMN PAYMENT_METHOD"))
                conn.commit()
            else:
                print(f"Skipping DROP COLUMN: {check} orders have failed migration.")

    print("Migration Complete.")

if __name__ == "__main__":
    migrate()
