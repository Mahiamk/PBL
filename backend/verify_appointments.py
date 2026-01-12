from app.db.database import engine
from sqlalchemy import text, inspect

def diagnose_appointments():
    with engine.connect() as connection:
        print("\n--- Diagnostic: Recent Appointments ---")
        try:
            # Check last 5 reserved appointments linking to normalized tables
            query = text("""
                SELECT 
                    a.APPOINTMENT_ID, 
                    a.CUSTOMER_NAME,
                    a.STATUS,
                    a.STAFF_ID,
                    s.STAFF_NAME,
                    a.SLOT_ID,
                    ts.START_TIME,
                    svc.SERVICE_NAME,
                    v.VENDOR_NAME
                FROM APPOINTMENT a
                LEFT JOIN STAFF s ON a.STAFF_ID = s.STAFF_ID
                LEFT JOIN TIME_SLOT ts ON a.SLOT_ID = ts.SLOT_ID
                LEFT JOIN SERVICE svc ON ts.SERVICE_ID = svc.SERVICE_ID
                LEFT JOIN VENDOR v ON s.VENDOR_ID = v.VENDOR_ID
                ORDER BY a.APPOINTMENT_ID DESC
                LIMIT 5
            """)
            
            result = connection.execute(query).fetchall()
            
            print(f"{'ID':<5} {'Customer':<20} {'Status':<10} {'Staff Name':<20} {'Service':<20} {'Time':<20} {'Vendor'}")
            print("-" * 110)
            
            for row in result:
                # Handle potential None values safely
                aid = str(row[0])
                cust = str(row[1]) if row[1] else "N/A"
                stat = str(row[2]) if row[2] else "N/A"
                sname = str(row[4]) if row[4] else "NULL (No Link)"
                svcname = str(row[7]) if row[7] else "NULL (No Link)"
                stime = str(row[6]) if row[6] else "NULL (No Link)"
                vname = str(row[8]) if row[8] else "N/A"
                
                print(f"{aid:<5} {cust:<20} {stat:<10} {sname:<20} {svcname:<20} {stime:<20} {vname}")
                
        except Exception as e:
            print(f"Error executing diagnostic query: {e}")

if __name__ == "__main__":
    diagnose_appointments()
