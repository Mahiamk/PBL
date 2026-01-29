from sqlalchemy import Column, Enum, Integer, String, Text, DECIMAL, ForeignKey, Boolean, DateTime
import enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

# Subscribers table for newsletter
class Subscriber(Base):
    __tablename__ = "SUBSCRIBERS"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    subscribed_at = Column(DateTime(timezone=True), server_default=func.now())

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    VENDOR = "vendor"
    CUSTOMER = "customer"

class UserStatus(str, enum.Enum):
    active = "active"
    PENDING = "pending"
    REJECTED = "rejected"

class RoleAdmin(Base):
    __tablename__ = "ROLE_ADMIN"
    
    role_id = Column("ROLE_ID", Integer, primary_key=True, index=True, autoincrement=True)
    role_name = Column("ROLE_NAME", String(50), unique=True, nullable=False) # e.g. Admin, Customer, Vendor
    description = Column("DESCRIPTION", String(255), nullable=True)

class Status(Base):
    __tablename__ = "STATUS"
    
    status_id = Column("STATUS_ID", Integer, primary_key=True, index=True, autoincrement=True)
    status_name = Column("STATUS_NAME", String(50), nullable=False) # e.g. Pending, Completed
    status_type = Column("STATUS_TYPE", String(50), nullable=False) # e.g. Order, Appointment, User
    status_description = Column("STATUS_DESCRIPTION", String(255), nullable=True)

class Store(Base):
    __tablename__ = "STORE"

    store_id = Column("STORE_ID", Integer, primary_key=True, index=True, autoincrement=True)
    store_name = Column("STORE_NAME", String(100), nullable=False)
    store_type = Column("STORE_TYPE", String(50))
    image_url = Column("IMAGE_URL", String(255), nullable=True)

    products = relationship("Product", back_populates="store")
    categories = relationship("Category", back_populates="store")

class PaymentMethod(Base):
    __tablename__ = "PAYMENT_METHOD"
    
    payment_method_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    method_name = Column(String(50), nullable=False, unique=True) # e.g. "online", "cod"
    description = Column(String(255), nullable=True)

class OrderHistory(Base):
    __tablename__ = "ORDER_HISTORY"
    
    history_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("ORDERS.ORDER_ID"), nullable=False)
    status = Column(String(50), nullable=True) # Kept for backward compatibility, same as new_state or redundant
    
    # New Columns requested
    old_state = Column("OLD_STATE", String(50), nullable=False, default="Initial")
    new_state = Column("NEW_STATE", String(50), nullable=True)
    changed_date = Column("CHANGED_DATE", DateTime(timezone=True), server_default=func.now())
    comment = Column(Text, nullable=True)

    order = relationship("Order", back_populates="order_history")

class Category(Base):
    __tablename__ = "CATEGORY"

    category_id = Column("CATEGORY_ID", Integer, primary_key=True, index=True, autoincrement=True)
    category_name = Column("CATEGORY_NAME", String(100), nullable=False)
    category_type = Column("CATEGORY_TYPE", String(50))
    store_id = Column("STORE_ID", Integer, ForeignKey("STORE.STORE_ID"), nullable=True)

    products = relationship("Product", back_populates="category")
    store = relationship("Store", back_populates="categories")

class Product(Base):
    __tablename__ = "PRODUCT"

    product_id = Column("PRODUCT_ID", Integer, primary_key=True, index=True, autoincrement=True)
    product_name = Column("PRODUCT_NAME", String(100), nullable=False)
    product_desc = Column("PRODUCT_DESC", Text)
    product_price = Column("PRODUCT_PRICE", DECIMAL(10, 2), nullable=False)
    image_url = Column("IMAGE_URL", Text, nullable=True)
    sku = Column("SKU", String(50), nullable=True)
    # stock_quantity moved to Inventory table
    status = Column("STATUS", String(20), default="active")
    
    # New fields for enhanced dashboard
    weight = Column("WEIGHT", DECIMAL(10, 2), nullable=True)
    tax_class = Column("TAX_CLASS", String(50), default="Taxable Goods")
    url_key = Column("URL_KEY", String(255), nullable=True)
    meta_title = Column("META_TITLE", String(255), nullable=True)
    meta_desc = Column("META_DESC", Text, nullable=True)
    visibility = Column("VISIBILITY", String(50), default="catalog_search")
    manage_stock = Column("MANAGE_STOCK", Boolean, default=True)
    stock_availability = Column("STOCK_AVAILABILITY", String(50), default="in_stock")
    
    # JSON field for flexible attributes (e.g. Sweetness levels, Add-ons)
    # Stored as JSON string or Text
    custom_options = Column("CUSTOM_OPTIONS", Text, nullable=True)

    store_id = Column("STORE_ID", Integer, ForeignKey("STORE.STORE_ID"))
    category_id = Column("CATEGORY_ID", Integer, ForeignKey("CATEGORY.CATEGORY_ID"))

    store = relationship("Store", back_populates="products")
    category = relationship("Category", back_populates="products")
    
    # Relationship to the new ProductImage table
    images_rel = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    
    # Relationship to Inventory
    inventory = relationship("Inventory", back_populates="product", uselist=False, cascade="all, delete-orphan")

    @property
    def stock_quantity(self):
        return self.inventory.stock_quantity if self.inventory else 0

    @stock_quantity.setter
    def stock_quantity(self, value):
        # We can't easily auto-create the inventory record in a setter without a session, 
        # but this might help if generic code tries to set it.
        if self.inventory:
            self.inventory.stock_quantity = value

class Inventory(Base):
    __tablename__ = "INVENTORY"

    inventory_id = Column("INVENTORY_ID", Integer, primary_key=True, autoincrement=True)
    stock_quantity = Column("STOCK_QUANTITY", Integer, default=0)
    low_stock_threshold = Column("LOW_STOCK_THRESHOLD", Integer, default=2)
    product_id = Column("PRODUCT_ID", Integer, ForeignKey("PRODUCT.PRODUCT_ID"), unique=True, nullable=False)

    product = relationship("Product", back_populates="inventory")

class ProductImage(Base):
    __tablename__ = "PRODUCT_IMAGE"

    image_id = Column("IMAGE_ID", Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column("PRODUCT_ID", Integer, ForeignKey("PRODUCT.PRODUCT_ID"), nullable=False)
    image_url = Column("IMAGE_URL", Text, nullable=False)
    color = Column("COLOR", String(50), nullable=False)
    is_main = Column("IS_MAIN", Boolean, default=False)

    product = relationship("Product", back_populates="images_rel")

class Service(Base):
    __tablename__ = "SERVICE"

    service_id = Column("SERVICE_ID", Integer, primary_key=True, index=True, autoincrement=True)
    service_name = Column("SERVICE_NAME", String(100), nullable=False)
    service_desc = Column("SERVICE_DESC", Text)
    service_price = Column("SERVICE_PRICE", DECIMAL(10, 2), nullable=False)
    image_url = Column("IMAGE_URL", Text, nullable=True)
    status = Column("STATUS", String(20), default="active")
    store_id = Column("STORE_ID", Integer, ForeignKey("STORE.STORE_ID"))
    category_id = Column("CATEGORY_ID", Integer, ForeignKey("CATEGORY.CATEGORY_ID"), nullable=True)
    
    store = relationship("Store")
    category = relationship("Category")

    @property
    def store_name(self):
        return self.store.store_name if self.store else None

    @property
    def store_type(self):
        return self.store.store_type if self.store else None

class Order(Base):
    __tablename__ = "ORDERS"

    order_id = Column("ORDER_ID", Integer, primary_key=True, index=True, autoincrement=True)
    customer_id = Column("CUSTOMER_ID", Integer, nullable=False)
    store_id = Column("STORE_ID", Integer, ForeignKey("STORE.STORE_ID"), nullable=False)
    order_date = Column("ORDER_DATE", DateTime(timezone=True), server_default=func.now())
    total_amount = Column("TOTAL_AMOUNT", DECIMAL(10, 2), nullable=False)
    # status = Column("STATUS", String(50), default="Processing") # Removed
    
    # Normalized Status
    status_id = Column("STATUS_ID", Integer, ForeignKey("STATUS.STATUS_ID"), nullable=True)
    status_rel = relationship("Status", lazy="joined")

    @property
    def status(self):
        if not self.status_rel:
            return "0"
            
        name = str(self.status_rel.status_name).lower()
        # Map DB Status Names to Frontend Codes
        if name in ["pending", "processing"]:
            return "0"
        if name in ["accepted", "completed", "confirmed"]:
            return "1"
        if name in ["cancelled", "rejected"]:
            return "-1"
        return self.status_rel.status_name

    # payment_method = Column("PAYMENT_METHOD", String(50)) 
    customer_name = Column("CUSTOMER_NAME", String(100), nullable=True)
    store_order_id = Column("STORE_ORDER_ID", Integer, default=0)

    # Normalized 3NF columns
    payment_method_id = Column("PAYMENT_METHOD_ID", Integer, ForeignKey("PAYMENT_METHOD.payment_method_id"), nullable=True)
    
    # Relationships
    payment_method_rel = relationship("PaymentMethod")
    order_history = relationship("OrderHistory", back_populates="order", cascade="all, delete-orphan")
    
    items = relationship("OrderItem", back_populates="order")
    store = relationship("Store")

    @property
    def payment_method(self):
        return self.payment_method_rel.method_name if self.payment_method_rel else None

class Transaction(Base):
    __tablename__ = "TRANSACTION"

    transaction_id = Column("TRANSACTION_ID", Integer, primary_key=True, index=True, autoincrement=True)
    
    order_id = Column("ORDER_ID", Integer, ForeignKey("ORDERS.ORDER_ID"), nullable=False)
    payment_method_id = Column("PAYMENT_METHOD_ID", Integer, ForeignKey("PAYMENT_METHOD.payment_method_id"), nullable=False)
    
    created_at = Column("CREATED_AT", DateTime(timezone=True), server_default=func.now())
    status = Column("STATUS", String(50), nullable=False)
    
    trans_data = Column("TRANS_DATA", Text, nullable=True)
    
    order = relationship("Order")
    payment_method_rel = relationship("PaymentMethod")

class OrderItem(Base):
    __tablename__ = "ORDER_ITEM"

    order_item_id = Column("ORDER_ITEM_ID", Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column("ORDER_ID", Integer, ForeignKey("ORDERS.ORDER_ID"), nullable=False)
    product_id = Column("PRODUCT_ID", Integer, ForeignKey("PRODUCT.PRODUCT_ID"), nullable=False)
    quantity = Column("QUANTITY", Integer, nullable=False)
    price = Column("PRICE", DECIMAL(10, 2), nullable=False)
    subtotal = Column("SUBTOTAL", DECIMAL(10, 2), nullable=True)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")

    @property
    def product_name(self):
        return self.product.product_name if self.product else "Unknown Product"

    @property
    def image_url(self):
        return self.product.image_url if self.product else None

class StaffService(Base):
    __tablename__ = "STAFF_SERVICE"

    staff_id = Column("STAFF_ID", Integer, ForeignKey("STAFF.STAFF_ID"), primary_key=True)
    service_id = Column("SERVICE_ID", Integer, ForeignKey("SERVICE.SERVICE_ID"), primary_key=True)
    experience_level = Column("EXPERIENCE_LEVEL", String(50), nullable=True)
    service_price = Column("SERVICE_PRICE", DECIMAL(10, 2), nullable=True)

    staff = relationship("Staff", back_populates="staff_services")
    service = relationship("Service")

class TimeSlot(Base):
    __tablename__ = "TIME_SLOT"

    slot_id = Column("SLOT_ID", Integer, primary_key=True, index=True, autoincrement=True)
    start_time = Column("START_TIME", DateTime(timezone=True), nullable=False)
    end_time = Column("END_TIME", DateTime(timezone=True), nullable=False)
    service_id = Column("SERVICE_ID", Integer, ForeignKey("SERVICE.SERVICE_ID"), nullable=False)

    service = relationship("Service")

class Appointment(Base):
    __tablename__ = "APPOINTMENT"

    appointment_id = Column("APPOINTMENT_ID", Integer, primary_key=True, index=True, autoincrement=True)
    customer_id = Column("CUSTOMER_ID", Integer, nullable=False)
    customer_name = Column("CUSTOMER_NAME", String(100), nullable=True)
    store_id = Column("STORE_ID", Integer, ForeignKey("STORE.STORE_ID"), nullable=False)
    
    # Normalized Columns
    slot_id = Column("SLOT_ID", Integer, ForeignKey("TIME_SLOT.SLOT_ID"), nullable=True)
    staff_id = Column("STAFF_ID", Integer, ForeignKey("STAFF.STAFF_ID"), nullable=True)
    
    # Legacy data support (Mapped columns with different attribute names)
    legacy_booking_date = Column("BOOKING_DATE", DateTime, nullable=True)
    legacy_barber_name = Column("BARBER_NAME", String(100), nullable=True)
    legacy_service_name = Column("SERVICE_NAME", String(100), nullable=True)
    
    status = Column("STATUS", String(50), default="Confirmed")
    
    # Relationships
    time_slot = relationship("TimeSlot")
    staff = relationship("Staff")
    store = relationship("Store")

    # Backward Compatibility Properties for frontend/API
    @property
    def booking_date(self):
        return self.time_slot.start_time if self.time_slot else self.legacy_booking_date
    
    @property
    def barber_name(self):
        return self.staff.staff_name if self.staff else self.legacy_barber_name

    @property
    def service_name(self):
        if self.time_slot and self.time_slot.service:
            return self.time_slot.service.service_name
        return self.legacy_service_name


class SystemLog(Base):
    __tablename__ = "system_logs"
    
    log_id = Column("LOG_ID", Integer, primary_key=True, index=True, autoincrement=True)
    action = Column("ACTION", Text, nullable=False)
    timestamp = Column("TIMESTAMP", DateTime(timezone=True), server_default=func.now())
    customer_id = Column("CUSTOMER_ID", Integer, nullable=True)
    vendor_id = Column("VENDOR_ID", Integer, nullable=True)

class Review(Base):
    __tablename__ = "REVIEW"

    review_id = Column("REVIEW_ID", Integer, primary_key=True, index=True, autoincrement=True)
    customer_id = Column("CUSTOMER_ID", Integer, nullable=False)
    customer_name = Column("CUSTOMER_NAME", String(100), nullable=True)
    store_id = Column("STORE_ID", Integer, ForeignKey("STORE.STORE_ID"), nullable=False)
    barber_name = Column("BARBER_NAME", String(100), nullable=True)
    rating = Column("RATING", Integer, nullable=False)
    comment = Column("COMMENT", Text, nullable=True)
    created_at = Column("CREATED_AT", DateTime(timezone=True), server_default=func.now())

    store = relationship("Store")
    status = Column("STATUS", String(50), default="Confirmed")

    store = relationship("Store")
class User(Base):
    __tablename__ = "USER"
    id = Column(Integer, primary_key=True, index=True)
    # 3NF Normalized: Split full_name into separate columns
    first_name = Column("FIRST_NAME", String(100), index=True)
    last_name = Column("LAST_NAME", String(100), index=True)
    initial = Column("INITIAL", String(10), nullable=True)  # Middle initial (optional)
    # Enforce uniqueness for phone number across all users (Customers & Vendors)
    phone_number = Column("PHONE_NUMBER", String(20), nullable=False, unique=True)  
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    # Removed is_active (redundant with status) - 3NF normalization
    # role = Column(Enum(UserRole), default=UserRole.CUSTOMER)
    role_id = Column("ROLE_ID", Integer, ForeignKey("ROLE_ADMIN.ROLE_ID"), nullable=True) # Normalized Role
    
    # Status field: 'active', 'inactive', 'pending', 'suspended'
    status = Column(String(50), default="active")
    profile_image = Column("PROFILE_IMAGE", Text, nullable=True)
    
    role_admin = relationship("RoleAdmin")

    # Computed property for backward compatibility
    @property
    def role(self):
        if self.role_admin:
            return self.role_admin.role_name
        return "customer" # Default fallback
    
    # Computed property for backward compatibility
    @property
    def full_name(self):
        """Computed full name from first_name, initial, and last_name"""
        parts = [self.first_name]
        if self.initial:
            parts.append(self.initial)
        if self.last_name:
            parts.append(self.last_name)
        return " ".join(filter(None, parts)) or None
    
    @property
    def is_active(self):
        """Computed is_active from status for backward compatibility"""
        return self.status == "active"
    
    # Relationship to Vendor profile
    vendor_profile = relationship("Vendor", back_populates="user", uselist=False)
    vendor_application = relationship("VendorApplication", back_populates="user", uselist=False)

class Vendor(Base):
    __tablename__ = "VENDOR"

    vendor_id = Column("VENDOR_ID", Integer, primary_key=True, index=True, autoincrement=True)
    vendor_name = Column("VENDOR_NAME", String(100), nullable=False)
    store_id = Column("STORE_ID", Integer, ForeignKey("STORE.STORE_ID"), nullable=True)
    user_id = Column("USER_ID", Integer, ForeignKey("USER.id"), nullable=True)

    store = relationship("Store")
    user = relationship("User", back_populates="vendor_profile")
    staff = relationship("Staff", back_populates="vendor")

class Staff(Base):
    __tablename__ = "STAFF"

    staff_id = Column("STAFF_ID", Integer, primary_key=True, autoincrement=True)
    staff_name = Column("STAFF_NAME", String(100), nullable=False)
    staff_info = Column("STAFF_INFO", Text)
    availability = Column("AVALIBALITY", String(50)) # Kept typo as per user request 'AVALIBALITY'
    vendor_id = Column("VENDOR_ID", Integer, ForeignKey("VENDOR.VENDOR_ID"))

    vendor = relationship("Vendor", back_populates="staff")
    staff_services = relationship("StaffService", back_populates="staff")

class Customer(Base):
    __tablename__ = "CUSTOMER"

    customer_id = Column("CUSTOMER_ID", Integer, primary_key=True, autoincrement=True)
    customer_lname = Column("CUSTOMER_LNAME", String(100), nullable=False)
    customer_fname = Column("CUSTOMER_FNAME", String(100), nullable=False)
    customer_num = Column("CUSTOMER_NUM", String(20), unique=True, nullable=False)
    email = Column("EMAIL", String(100), unique=True, nullable=False)
    customer_initial = Column("CUSTOMER_INTIAL", String(5))
    password_hash = Column("PASSWORD_HASH", String(255), nullable=False)
    role_id = Column("ROLE_ID", Integer, ForeignKey("ROLE_ADMIN.ROLE_ID"))

    role_admin = relationship("RoleAdmin")



class VendorApplication(Base):
    __tablename__ = "VENDOR_APPLICATION"
    
    application_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("USER.id"), nullable=False)
    business_name = Column(String(255), nullable=False)
    contact_details = Column(Text, nullable=True)
    # Changed from Enum to String to prevent LookupError
    status = Column(String(50), default="pending")
    vendor_type = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="vendor_application")

class Message(Base):
    __tablename__ = "MESSAGE"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("USER.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("USER.id"), nullable=False)
    content = Column(Text, nullable=True) # Content can be empty if it's just an attachment
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    is_read = Column(Boolean, default=False, server_default='0', nullable=False)
    message_type = Column(String(50), default="text") # text, image, file, audio
    attachment_url = Column(Text, nullable=True)
    reply_to_id = Column(Integer, ForeignKey("MESSAGE.id"), nullable=True)
    
    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])
    reply_to = relationship("Message", remote_side=[id], backref="replies")

class Notification(Base):
    __tablename__ = "NOTIFICATION"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("USER.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False) # 'order', 'appointment', 'system'
    related_id = Column(Integer, nullable=True) # ID of the order/appointment
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="notifications")

# Add back_populates to User
User.notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
