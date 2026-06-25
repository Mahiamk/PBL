from app.db.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()

print("--- Data in VENDOR table ---")
result = db.execute(text("SELECT VENDOR_ID, VENDOR_NAME, STORE_ID FROM VENDOR"))
for row in result:
    print(row)

