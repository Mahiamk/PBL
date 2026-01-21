from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.schemas.schemas import Order as OrderSchema, OrderCreate, OrderStatusUpdate
from app.models import models
from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.models import User

router = APIRouter()

@router.post("/", response_model=List[OrderSchema])
def create_order(order_data: OrderCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Group items by store_id
    items_by_store = {}
    out_of_stock_items = []
    
    # First pass: Validate products and group by store
    for item in order_data.items:
        product = db.query(models.Product).filter(models.Product.product_id == item.product_id).first()
        if not product:
            print(f"Product {item.product_id} not found")
            raise HTTPException(status_code=404, detail=f"Product with ID {item.product_id} not found")
            
        # Updated for Inventory Normalization
        current_stock = product.inventory.stock_quantity if product.inventory else 0
        
        if current_stock < item.quantity:
             print(f"Not enough stock for {product.product_name}: {current_stock} < {item.quantity}")
             out_of_stock_items.append(product.product_name)

        store_id = product.store_id
        if store_id not in items_by_store:
            items_by_store[store_id] = []
            
        items_by_store[store_id].append((item, product))
    
    if out_of_stock_items:
        raise HTTPException(status_code=400, detail=f"Not enough stock for: {', '.join(out_of_stock_items)}")
    
    created_orders = []
    
    try:
        # Create one order per store
        for store_id, items_with_products in items_by_store.items():
            total_amount = 0.0
            db_order_items = []
            
            # Create Order object first (to get ID if needed, but we add items to it)
            # We'll calculate total first
            
            for item_data, product in items_with_products:
                subtotal = item_data.quantity * float(product.product_price)
                total_amount += subtotal
                
                # Decrement stock (Inventory Normalization)
                if product.inventory:
                    product.inventory.stock_quantity -= item_data.quantity
                
                # Create OrderItem
                db_order_item = models.OrderItem(
                    product_id=product.product_id,
                    quantity=item_data.quantity,
                    price=product.product_price,
                    subtotal=subtotal
                )
                # Explicitly set the product relationship so it's available for the property
                db_order_item.product = product
                db_order_items.append(db_order_item)

            # Calculate next store_order_id
            max_store_order_id = db.query(func.max(models.Order.store_order_id)).filter(models.Order.store_id == store_id).scalar()
            next_store_order_id = (max_store_order_id or 0) + 1

            # Resolve Payment Method ID (3NF)
            payment_method_id = None
            if order_data.payment_method:
                pm = db.query(models.PaymentMethod).filter(models.PaymentMethod.method_name == order_data.payment_method).first()
                if not pm:
                    pm = models.PaymentMethod(method_name=order_data.payment_method, description="Auto-created")
                    db.add(pm)
                    db.flush()
                payment_method_id = pm.payment_method_id

            # Resolve Initial Status ID (Pending)
            pending_status = db.query(models.Status).filter(models.Status.status_name == "Pending").first()
            if not pending_status:
                pending_status = db.query(models.Status).filter(models.Status.status_name == "Processing").first()

            # Create Order
            db_order = models.Order(
                customer_id=current_user.id,
                customer_name=(current_user.full_name or current_user.email or "Unknown"),
                store_id=store_id,
                store_order_id=next_store_order_id,
                total_amount=total_amount,
                status_id=pending_status.status_id if pending_status else None,
                payment_method_id=payment_method_id,
                items=db_order_items
            )
            
            db.add(db_order)
            db_order.order_history.append(models.OrderHistory(
                status="Pending",
                new_state="Pending",
                old_state="Initial",
                comment="Order Created - Awaiting Vendor Approval"
            ))
            
            created_orders.append(db_order)

            # --- NOTIFICATION LOGIC ---
            # Find the vendor User ID associated with this store
            vendor = db.query(models.Vendor).filter(models.Vendor.store_id == store_id).first()
            if vendor and vendor.user_id:
                notification = models.Notification(
                    user_id=vendor.user_id,
                    title="New Order Received",
                    message=f"You have received a new order #{next_store_order_id} from {db_order.customer_name}. Total: ${total_amount:.2f}",
                    type="order",
                    related_id=None, # Will update after flush/commit if we want the real DB ID, or use db_order object ref if possible
                )
                db.add(notification)
                # Note: We can't set related_id=db_order.order_id yet because it's not committed/flushed.
                # However, since we commit all at once at the end, SQLAlchemy handles relationships, but here we are manually setting an integer ID.
                # We should probably flush first or add it to a list to process after flush.
        
        # Flush to generate IDs
        db.flush() 

        # Now update related_id for notifications (if we were storing them in a list, but simpler approach is:)
        # Actually simplest is to commit, then iterate created_orders again to create notifications.
        # But we already did logic inside the loop.
        # Let's adjust the strategy: 
        # 1. Commit orders. 
        # 2. Create notifications. 
        # 3. Commit notifications.
        
        db.commit()
        
        # Create notifications after order commit to ensure IDs exist
        for order in created_orders:
            db.refresh(order)
            vendor = db.query(models.Vendor).filter(models.Vendor.store_id == order.store_id).first()
            if vendor and vendor.user_id:
                notif = models.Notification(
                    user_id=vendor.user_id,
                    title="New Order Received",
                    message=f"You have received a new order #{order.store_order_id} from {order.customer_name}. Total: ${float(order.total_amount):.2f}",
                    type="order",
                    related_id=order.order_id,
                )
                db.add(notif)
        
        # Final commit for notifications
        db.commit()

        return created_orders
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{order_id}/status", response_model=OrderSchema)
def update_order_status(
    order_id: int, 
    status_update: OrderStatusUpdate, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"DEBUG AUTH: Request by User {current_user.id} Role: {current_user.role} for Order {order_id}")
    order = db.query(models.Order).filter(models.Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check for Admin (robust string conversion)
    if str(current_user.role).lower() == "admin":
         # Admin can edit anything
         pass
    else:
        # Check for Vendor
        vendor = db.query(models.Vendor).filter(models.Vendor.user_id == current_user.id).first()
        
        if not vendor:
            print(f"DEBUG AUTH: No vendor profile found for User {current_user.id}")
            raise HTTPException(status_code=403, detail="User is not a vendor")

        # SELF-HEALING LOGIC: If Vendor Store ID is missing, try to find it via Application
        if vendor.store_id is None:
            print("DEBUG AUTH: Vendor has no Store ID. Attempting self-healing...")
            store = db.query(models.Store).filter(models.Store.store_name == vendor.vendor_name).first()
            if store:
                 print(f"DEBUG AUTH: Found matching store '{store.store_name}' (ID: {store.store_id}). Linking...")
                 vendor.store_id = store.store_id
                 db.add(vendor)
                 db.commit()
                 db.refresh(vendor)

        if vendor.store_id != order.store_id:
             print(f"DEBUG AUTH: DENIED. Vendor Store ({vendor.store_id}) != Order Store ({order.store_id})")
             raise HTTPException(status_code=403, detail="Not authorized to manage this order")
    
    # 3NF History Tracking
    old_state = order.status # Uses property to get "0"/"1"/"-1" code
    target_code = status_update.status
    
    # Resolve target_code to status_id
    new_status_obj = None
    s_in = str(target_code).lower()
    
    if s_in in ["0", "pending", "processing"]:
        new_status_obj = db.query(models.Status).filter(models.Status.status_name == "Pending").first()
    elif s_in in ["1", "accepted", "completed", "confirmed"]:
        new_status_obj = db.query(models.Status).filter(models.Status.status_name == "Accepted").first()
        if not new_status_obj:
            new_status_obj = db.query(models.Status).filter(models.Status.status_name == "Completed").first()
    elif s_in in ["-1", "cancelled", "rejected"]:
        new_status_obj = db.query(models.Status).filter(models.Status.status_name == "Cancelled").first()
    
    if new_status_obj and order.status_id != new_status_obj.status_id:
        # Update Order Status
        order.status_id = new_status_obj.status_id
        
        # Add History
        history = models.OrderHistory(
            order_id=order.order_id,
            status=target_code, # Use the input code (0/1/-1) for history consistency
            old_state=old_state,
            new_state=target_code,
            comment="Status updated via API (Vendor/Admin)"
        )
        db.add(history)
        
        # --- Update Transaction Status (if applicable) ---
        if str(target_code) == "-1" or str(target_code).lower() == "cancelled":
             # If Vendor Cancels, transaction should be failed/voided if it exists
             transaction = db.query(models.Transaction).filter(models.Transaction.order_id == order.order_id).first()
             if transaction and transaction.status != "Failed":
                 transaction.status = "Failed" 

    db.commit()
    db.refresh(order)
    return order

@router.delete("/{order_id}", response_model=OrderSchema)
def delete_order(
    order_id: int, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Allow customer to 'delete' (cancel) their order.
    The database effect is setting status to 'Cancelled'.
    The vendor will see this status update.
    """
    order = db.query(models.Order).filter(models.Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Authorization Check
    # Only the customer who created it or Admin can delete it
    if str(current_user.role).lower() != "admin" and order.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this order")

    # Validation: Can we cancel?
    current_status = str(order.status or "").lower()
    if current_status not in ["0", "pending", "processing", "awaiting_payment"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot cancel order in '{order.status}' status. Contact support."
        )

    # Perform Cancellation
    new_status_code = "-1" # cancelled
    cancelled_status = db.query(models.Status).filter(models.Status.status_name == "Cancelled").first()
    
    if cancelled_status and order.status_id != cancelled_status.status_id:
        # History
        history = models.OrderHistory(
            order_id=order.order_id,
            status=new_status_code,
            old_state=order.status,
            new_state=new_status_code,
            comment="Order cancelled by customer"
        )
        db.add(history)
        
        order.status_id = cancelled_status.status_id
        
        # Update Transaction if exists
        transaction = db.query(models.Transaction).filter(models.Transaction.order_id == order.order_id).first()
        if transaction:
            transaction.status = "Failed" 
    
    db.commit()
    db.refresh(order)
    
    return order
