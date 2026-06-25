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
            
        if product.stock_quantity < item.quantity:
             print(f"Not enough stock for {product.product_name}: {product.stock_quantity} < {item.quantity}")
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
                
                # Decrement stock
                product.stock_quantity -= item_data.quantity
                
                # Create OrderItem
                db_order_item = models.OrderItem(
                    product_id=product.product_id,
                    quantity=item_data.quantity,
                    price=product.product_price
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

            # Create Order
            db_order = models.Order(
                customer_id=current_user.id,
                customer_name=(current_user.full_name or current_user.email or "Unknown"),
                store_id=store_id,
                store_order_id=next_store_order_id,
                total_amount=total_amount,
                status="Pending",
                payment_method_id=payment_method_id,
                items=db_order_items
            )
            
            db.add(db_order)
            db_order.order_history.append(models.OrderHistory(
                status="Pending",
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
    if order.status != status_update.status:
        history = models.OrderHistory(
            order_id=order.order_id,
            status=status_update.status,
            comment="Status updated via API"
        )
        db.add(history)

    order.status = status_update.status
    db.commit()
    db.refresh(order)
    return order
