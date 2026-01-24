from app.db.database import SessionLocal
from app.models import models
from app.models.models import Transaction, Order, PaymentMethod
import json

def populate_transactions():
    api_db = SessionLocal()
    try:
        # Get valid payment methods
        payment_methods = api_db.query(PaymentMethod).all()
        pm_map = {pm.payment_method_id: pm.method_name for pm in payment_methods}
        
        default_pm_id = None
        if pm_map:
            default_pm_id = list(pm_map.keys())[0]
            print(f"Available Payment Methods: {pm_map}")
        else:
            print("Warning: No Payment Methods found. Will look for existing ones or fail if constraints enforced.")

        orders = api_db.query(Order).all()
        print(f"Found {len(orders)} orders.")

        added_count = 0
        for order in orders:
            # Check if transaction exists
            existing = api_db.query(Transaction).filter(Transaction.order_id == order.order_id).first()
            if existing:
                continue

            pm_id = order.payment_method_id
            if not pm_id:
                if default_pm_id:
                    pm_id = default_pm_id
                else:
                    print(f"Skipping Order {order.order_id}: No payment method ID available.")
                    continue
            
            # Determine status mapping
            status = "Success"
            order_status_lower = (order.status or "").lower()
            
            if order_status_lower in ["cancelled", "failed", "declined"]:
                status = "Failed"
            elif order_status_lower in ["pending", "processing", "awaiting_payment"]:
                status = "Pending"
            
            tx = Transaction(
                order_id=order.order_id,
                payment_method_id=pm_id,
                status=status,
                created_at=order.order_date,
                trans_data=json.dumps({
                    "source": "migration_script",
                    "original_order_status": order.status,
                    "amount": float(order.total_amount) if order.total_amount else 0.0
                })
            )
            api_db.add(tx)
            added_count += 1
        
        api_db.commit()
        print(f"Successfully created {added_count} transactions.")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        api_db.rollback()
    finally:
        api_db.close()

if __name__ == "__main__":
    populate_transactions()
