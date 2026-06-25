from datetime import datetime, date
from app.schemas.schemas import (
    Vendor, Customer, Order, Product, Store, Appointment, OrderItem
)
from app.core.security import get_password_hash

# Mock Users DB
hashed_password = get_password_hash("password")
fake_users_db = {
    "admin": {"username": "admin", "password": hashed_password, "role": "admin", "user_id": 1},
    "customer": {"username": "customer", "password": hashed_password, "role": "customer", "user_id": 1},
    # Vendors
    "vendor_tech": {"username": "vendor_tech", "password": hashed_password, "role": "vendor", "user_id": 2},
    "vendor_barber": {"username": "vendor_barber", "password": hashed_password, "role": "vendor", "user_id": 3},
    "vendor_tailor": {"username": "vendor_tailor", "password": hashed_password, "role": "vendor", "user_id": 4},
    "vendor_bottle": {"username": "vendor_bottle", "password": hashed_password, "role": "vendor", "user_id": 5},
    "vendor_drink": {"username": "vendor_drink", "password": hashed_password, "role": "vendor", "user_id": 6},
    "vendor_massage": {"username": "vendor_massage", "password": hashed_password, "role": "vendor", "user_id": 7},
    "vendor_clothes": {"username": "vendor_clothes", "password": hashed_password, "role": "vendor", "user_id": 8},
}

# Mock Data Stores
mock_stores = [
    Store(store_id=1, store_name="Tech Gadgets Hub", store_type="Electronics"),
    Store(store_id=2, store_name="Barber Shop", store_type="Services"),
    Store(store_id=3, store_name="Tailor Shop", store_type="Services"),
    Store(store_id=4, store_name="Bottle Shop", store_type="Retail"),
    Store(store_id=5, store_name="Drink Shop", store_type="Food & Beverage"),
    Store(store_id=6, store_name="Massage Service", store_type="Services"),
    Store(store_id=7, store_name="Clothing Shop", store_type="Fashion"),
]

# Map user_id to store_id
vendor_store_map = {
    2: 1, # vendor_tech -> Tech Gadgets Hub
    3: 2, # vendor_barber -> Barber Shop
    4: 3, # vendor_tailor -> Tailor Shop
    5: 4, # vendor_bottle -> Bottle Shop
    6: 5, # vendor_drink -> Drink Shop
    7: 6, # vendor_massage -> Massage Service
    8: 7, # vendor_clothes -> Clothing Shop
}

mock_products = [
    Product(product_id=1, product_name="Wireless Mouse", product_price=25.99, store_id=1, category_id=3, product_desc="Ergonomic wireless mouse"),
    Product(product_id=2, product_name="Mechanical Keyboard", product_price=89.99, store_id=1, category_id=3, product_desc="RGB Mechanical Keyboard"),
    Product(product_id=3, product_name="Stainless Steel Thermos - Yellow", product_price=35.00, store_id=1, category_id=2, product_desc="Keep your drinks hot or cold"),
    Product(product_id=4, product_name="Stainless Steel Thermos - Black", product_price=35.00, store_id=1, category_id=2, product_desc="Sleek black design"),
    Product(product_id=5, product_name="Modern Ceramic Vase - Green", product_price=25.00, store_id=1, category_id=3, product_desc="Minimalist design"),
    Product(product_id=6, product_name="Premium Haircut Service", product_price=45.00, store_id=2, category_id=1, product_desc="Professional haircut and styling"),
    Product(product_id=7, product_name="Cupping Therapy", product_price=50.00, store_id=2, category_id=4, product_desc="Traditional cupping therapy for relaxation"),
    Product(product_id=8, product_name="Suit Alteration", product_price=30.00, store_id=3, category_id=5, product_desc="Professional suit fitting and alteration"),
]

mock_orders = [
    Order(
        order_id=101, 
        order_date=datetime.now(), 
        total_amount=115.98, 
        customer_id=1, 
        status="Pending",
        payment_method="Online Payment",
        items=[
            OrderItem(order_item_id=1, quantity=1, subtotal=25.99, product_id=1, product_name="Wireless Mouse", category_id=3),
            OrderItem(order_item_id=2, quantity=1, subtotal=89.99, product_id=2, product_name="Mechanical Keyboard", category_id=3)
        ]
    )
]

mock_appointments = [
    Appointment(
        appointment_id=1, 
        booking_date=datetime.now(), 
        customer_id=1, 
        store_id=1, 
        service_name="Laptop Repair", 
        customer_name="John Doe",
        status="Confirmed"
    )
]

mock_customer = Customer(customer_id=1, customer_name="John Doe", email="john@example.com", role_id=3)
mock_vendor = Vendor(vendor_id=1, vendor_name="Tech Solutions Inc", role_id=2, store_id=1)
