from sqlalchemy import inspect, text, Boolean, DECIMAL, String, Text
from app.db.database import engine

def update_schema_v3():
    inspector = inspect(engine)
    columns = [col["name"] for col in inspector.get_columns("PRODUCT")]
    print(f"Current columns: {columns}")

    with engine.connect() as conn:
        if "WEIGHT" not in columns:
            print("Adding WEIGHT column...")
            conn.execute(text("ALTER TABLE PRODUCT ADD COLUMN WEIGHT DECIMAL(10, 2)"))
            
        if "TAX_CLASS" not in columns:
            print("Adding TAX_CLASS column...")
            conn.execute(text("ALTER TABLE PRODUCT ADD COLUMN TAX_CLASS VARCHAR(50) DEFAULT 'Taxable Goods'"))
            
        if "URL_KEY" not in columns:
            print("Adding URL_KEY column...")
            conn.execute(text("ALTER TABLE PRODUCT ADD COLUMN URL_KEY VARCHAR(255)"))
            
        if "META_TITLE" not in columns:
            print("Adding META_TITLE column...")
            conn.execute(text("ALTER TABLE PRODUCT ADD COLUMN META_TITLE VARCHAR(255)"))
            
        if "META_DESC" not in columns:
            print("Adding META_DESC column...")
            conn.execute(text("ALTER TABLE PRODUCT ADD COLUMN META_DESC TEXT"))
            
        if "VISIBILITY" not in columns:
            print("Adding VISIBILITY column...")
            conn.execute(text("ALTER TABLE PRODUCT ADD COLUMN VISIBILITY VARCHAR(50) DEFAULT 'catalog_search'"))
            
        if "MANAGE_STOCK" not in columns:
            print("Adding MANAGE_STOCK column...")
            # MySQL uses TINYINT(1) for BOOLEAN
            conn.execute(text("ALTER TABLE PRODUCT ADD COLUMN MANAGE_STOCK BOOLEAN DEFAULT TRUE"))
            
        if "STOCK_AVAILABILITY" not in columns:
            print("Adding STOCK_AVAILABILITY column...")
            conn.execute(text("ALTER TABLE PRODUCT ADD COLUMN STOCK_AVAILABILITY VARCHAR(50) DEFAULT 'in_stock'"))
            
        conn.commit()
    print("Schema update v3 complete.")

if __name__ == "__main__":
    update_schema_v3()
