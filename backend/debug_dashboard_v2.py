from app.db.database import SessionLocal
from app.models import models
from app.models.models import User, UserRole
from sqlalchemy import func, text
from datetime import datetime, timedelta
import json

def test_dashboard_api_logic():
    db = SessionLocal()
    try:
        print("--- DEBUGGING DASHBOARD DATA ---")
        
        # 1. COUNTS
        total_vendors = db.query(User).filter(User.role == UserRole.VENDOR).count()
        total_customers = db.query(User).filter(User.role == UserRole.CUSTOMER).count()
        total_orders = db.query(models.Order).count()
        
        print(f"Vendors: {total_vendors}")
        print(f"Customers: {total_customers}")
        print(f"Orders: {total_orders}")
        
        # 2. ORDERS GRAPH (Daily)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        orders_data = db.query(
            func.date(models.Order.order_date).label('date'),
            func.count(models.Order.order_id).label('count')
        ).filter(models.Order.order_date >= thirty_days_ago)\
         .group_by('date')\
         .order_by('date').all()
        
        print(f"Orders Graph Data (Last 30 days): {len(orders_data)} points")
        for d in orders_data:
            print(f"  {d.date}: {d.count}")

        # 3. VENDOR APPS GRAPH (Daily) -> Wait, does frontend use 'users_graph' for vendors or users? 
        # Backend says: users_graph = vendor applications.
        vendors_data = db.query(
            func.date(models.VendorApplication.created_at).label('date'),
            func.count(models.VendorApplication.application_id).label('count')
        ).filter(models.VendorApplication.created_at >= thirty_days_ago)\
         .group_by('date')\
         .order_by('date').all()
         
        print(f"Vendor Apps Graph Data (Last 30 days): {len(vendors_data)} points")
        
        # 4. WEEKLY DATA (Check MySQL function usage)
        try:
            twelve_weeks_ago = datetime.now() - timedelta(weeks=12)
            orders_data_w = db.query(
                func.date_format(models.Order.order_date, '%Y-%u').label('week'),
                func.count(models.Order.order_id).label('count')
            ).filter(models.Order.order_date >= twelve_weeks_ago)\
            .group_by('week')\
            .order_by('week').all()
            print(f"Orders Weekly Data: {len(orders_data_w)} points (MySQL function works)")
        except Exception as e:
            print(f"Orders Weekly Data FAILED: {e}")

    finally:
        db.close()

if __name__ == "__main__":
    test_dashboard_api_logic()
