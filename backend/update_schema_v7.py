from app.db.database import engine
from sqlalchemy import text

def update_schema():
    with engine.connect() as connection:
        try:
            connection.execute(text("""
                CREATE TABLE IF NOT EXISTS SERVICE (
                    SERVICE_ID INT AUTO_INCREMENT PRIMARY KEY,
                    SERVICE_NAME VARCHAR(100) NOT NULL,
                    SERVICE_DESC TEXT,
                    SERVICE_PRICE DECIMAL(10, 2) NOT NULL,
                    IMAGE_URL TEXT,
                    STATUS VARCHAR(20) DEFAULT 'active',
                    STORE_ID INT,
                    FOREIGN KEY (STORE_ID) REFERENCES STORE(STORE_ID)
                )
            """))
            print("Created SERVICE table.")
        except Exception as e:
            print(f"Could not create SERVICE table: {e}")
            
        connection.commit()

if __name__ == "__main__":
    print("Updating database schema...")
    update_schema()
    print("Schema update complete.")