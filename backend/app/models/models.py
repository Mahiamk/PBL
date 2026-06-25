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
    status = Column(String(50), nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
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
    stock_quantity = Column("STOCK_QUANTITY", Integer, default=0)
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
    
    store = relationship("Store")

class Order(Base):
    __tablename__ = "ORDERS"

    order_id = Column("ORDER_ID", Integer, primary_key=True, index=True, autoincrement=True)
    customer_id = Column("CUSTOMER_ID", Integer, nullable=False)
    store_id = Column("STORE_ID", Integer, ForeignKey("STORE.STORE_ID"), nullable=False)
    order_date = Column("ORDER_DATE", DateTime(timezone=True), server_default=func.now())
    total_amount = Column("TOTAL_AMOUNT", DECIMAL(10, 2), nullable=False)
    status = Column("STATUS", String(50), default="Processing")
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

class OrderItem(Base):
    __tablename__ = "ORDER_ITEM"

    order_item_id = Column("ORDER_ITEM_ID", Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column("ORDER_ID", Integer, ForeignKey("ORDERS.ORDER_ID"), nullable=False)
    product_id = Column("PRODUCT_ID", Integer, ForeignKey("PRODUCT.PRODUCT_ID"), nullable=False)
    quantity = Column("QUANTITY", Integer, nullable=False)
    price = Column("PRICE", DECIMAL(10, 2), nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")

    @property
    def product_name(self):
        return self.product.product_name if self.product else "Unknown Product"

    @property
    def image_url(self):
        return self.product.image_url if self.product else None

class ServiceProvider(Base):
    __tablename__ = "SERVICE_PROVIDER"

    provider_id = Column("PROVIDER_ID", Integer, primary_key=True, index=True, autoincrement=True)
    name = Column("NAME", String(100), nullable=False)
    contact = Column("CONTACT", String(255), nullable=True) # Normalized "contact" attribute
    store_id = Column("STORE_ID", Integer, ForeignKey("STORE.STORE_ID"), nullable=False)

    store = relationship("Store")

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
    provider_id = Column("PROVIDER_ID", Integer, ForeignKey("SERVICE_PROVIDER.PROVIDER_ID"), nullable=True)
    
    # Legacy data support (Mapped columns with different attribute names)
    legacy_booking_date = Column("BOOKING_DATE", DateTime, nullable=True)
    legacy_barber_name = Column("BARBER_NAME", String(100), nullable=True)
    legacy_service_name = Column("SERVICE_NAME", String(100), nullable=True)
    
    status = Column("STATUS", String(50), default="Confirmed")
    
    # Relationships
    time_slot = relationship("TimeSlot")
    provider = relationship("ServiceProvider")
    store = relationship("Store")

    # Backward Compatibility Properties for frontend/API
    @property
    def booking_date(self):
        return self.time_slot.start_time if self.time_slot else self.legacy_booking_date
    
    @property
    def barber_name(self):
        return self.provider.name if self.provider else self.legacy_barber_name

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
    phone_number = Column("PHONE_NUMBER", String(20), nullable=True)  # User phone number
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    # Removed is_active (redundant with status) - 3NF normalization
    role = Column(Enum(UserRole, values_callable=lambda x: [e.value for e in x]), default=UserRole.CUSTOMER)
    # Status field: 'active', 'inactive', 'pending', 'suspended'
    status = Column(String(50), default="active")
    profile_image = Column("PROFILE_IMAGE", Text, nullable=True)
    
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
