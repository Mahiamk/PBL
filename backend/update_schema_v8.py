from app.db.database import engine
from sqlalchemy import text

def update_schema():
    with engine.connect() as connection:
        try:
            # Create PRODUCT_IMAGE table to store image+color pairs
            connection.execute(text("""
                CREATE TABLE IF NOT EXISTS PRODUCT_IMAGE (
                    IMAGE_ID INT AUTO_INCREMENT PRIMARY KEY,
                    PRODUCT_ID INT NOT NULL,
                    IMAGE_URL TEXT NOT NULL,
                    COLOR VARCHAR(50) NOT NULL,
                    IS_MAIN BOOLEAN DEFAULT FALSE,
                    FOREIGN KEY (PRODUCT_ID) REFERENCES PRODUCT(PRODUCT_ID) ON DELETE CASCADE
                )
            """))
            print("Created PRODUCT_IMAGE table.")
            
        except Exception as e:
            print(f"Error updating schema: {e}")
            
        connection.commit()

if __name__ == "__main__":
    print("Updating database schema v8...")
    update_schema()
    print("Schema update complete.")