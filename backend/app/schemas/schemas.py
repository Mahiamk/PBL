
# --- Subscriber Schemas ---
from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional

class SubscriberBase(BaseModel):
    email: EmailStr

class SubscriberCreate(SubscriberBase):
    pass

class Subscriber(SubscriberBase):
    id: int
    subscribed_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RoleAdminBase(BaseModel):
    role_name: str
    description: Optional[str] = None

class RoleAdminCreate(RoleAdminBase):
    pass

class RoleAdmin(RoleAdminBase):
    role_id: int

    model_config = ConfigDict(from_attributes=True)

class StaffBase(BaseModel):
    staff_name: str
    staff_info: Optional[str] = None
    availability: Optional[str] = None
    vendor_id: int

class StaffCreate(StaffBase):
    pass

class Staff(StaffBase):
    staff_id: int

    model_config = ConfigDict(from_attributes=True)

class StaffServiceBase(BaseModel):
    staff_id: int
    service_id: int
    experience_level: Optional[str] = None
    service_price: Optional[float] = None

class StaffServiceCreate(StaffServiceBase):
    pass

class StaffService(StaffServiceBase):
    model_config = ConfigDict(from_attributes=True)

class CustomerTableBase(BaseModel):
    customer_lname: str
    customer_fname: str
    customer_num: Optional[str] = None
    email: EmailStr
    customer_initial: Optional[str] = None
    role_id: Optional[int] = None

class CustomerTableCreate(CustomerTableBase):
    password: str

class CustomerTable(CustomerTableBase):
    customer_id: int

    model_config = ConfigDict(from_attributes=True)

from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime, date, time

# --- Shared Schemas ---

class Role(BaseModel):
    role_id: int
    role_name: str
    role_position: Optional[str] = None

class Status(BaseModel):
    status_id: int
    status_name: str
    status_type: Optional[str] = None

# --- Vendor Schemas ---

class VendorBase(BaseModel):
    vendor_name: str
    vendor_info: Optional[str] = None
    category_type: Optional[str] = None

class Vendor(VendorBase):
    vendor_id: int
    role_id: Optional[int] = None
    store_id: Optional[int] = None

# --- Store & Product Schemas ---

class CategoryBase(BaseModel):
    category_name: str
    category_type: Optional[str] = None
    store_id: Optional[int] = None

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    category_id: int
    store_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class Store(BaseModel):
    store_id: int
    store_name: str
    store_type: Optional[str] = None
    image_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ProductBase(BaseModel):
    product_name: str
    product_desc: Optional[str] = None
    product_price: float
    category_id: Optional[int] = None
    image_url: Optional[str] = None
    sku: Optional[str] = None
    stock_quantity: Optional[int] = 100
    status: Optional[str] = "active"
    
    # New fields
    weight: Optional[float] = None
    tax_class: Optional[str] = "Taxable Goods"
    url_key: Optional[str] = None
    meta_title: Optional[str] = None
    meta_desc: Optional[str] = None
    visibility: Optional[str] = "catalog_search"
    manage_stock: Optional[bool] = True
    stock_availability: Optional[str] = "in_stock"
    custom_options: Optional[str] = None # JSON string

class ProductImageBase(BaseModel):
    image_url: str
    color: str
    is_main: Optional[bool] = False

class ProductImage(ProductImageBase):
    image_id: int
    product_id: int
    
    model_config = ConfigDict(from_attributes=True)

class Product(ProductBase):
    product_id: int
    store_id: Optional[int] = None
    category: Optional[Category] = None
    store: Optional[Store] = None
    # Include the images in the response
    images_rel: List[ProductImage] = []

    model_config = ConfigDict(from_attributes=True)

class Inventory(BaseModel):
    inventory_id: int
    stock_quantity: int
    low_stock_threshold: int
    product_id: int

# --- Customer Schemas ---

class CustomerBase(BaseModel):
    customer_name: str
    email: Optional[str] = None
    customer_num: Optional[str] = None
    matric_no: Optional[str] = None
    status: Optional[str] = "active"
    created_at: Optional[datetime] = None
    profile_image: Optional[str] = None

class Customer(CustomerBase):
    customer_id: int
    role_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

# --- Order Schemas ---

class OrderItem(BaseModel):
    order_item_id: int
    quantity: int
    subtotal: Optional[float] = None # Calculated field
    product_id: int
    product_name: Optional[str] = None # For display convenience
    category_id: Optional[int] = None # For analytics
    price: Optional[float] = None
    image_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    product_price: float # To calculate subtotal

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    payment_method: str

class OrderStatusUpdate(BaseModel):
    status: str

class Order(BaseModel):
    order_id: int
    store_order_id: Optional[int] = None
    order_date: datetime
    total_amount: float
    customer_id: int
    status: str
    payment_method: Optional[str] = "Online Payment"
    items: List[OrderItem] = []
    customer_name: Optional[str] = None
    vendor_user_id: Optional[int] = None # Added for messaging support
    store_name: Optional[str] = None # Added for UI display

    model_config = ConfigDict(from_attributes=True)

# --- Service & Appointment Schemas ---

class Service(BaseModel):
    service_id: int
    service_name: str
    price: float
    store_id: int
    category_id: Optional[int] = None

# --- New Schemas for Product Management ---

class AttributeCreate(BaseModel):
    attribute_name: str
    attribute_values: List[str]

# Schema for the new Image+Color structure
class ProductImageBase(BaseModel):
    image_url: str
    color: str
    is_main: Optional[bool] = False

class ProductImage(ProductImageBase):
    image_id: int
    product_id: int
    
    model_config = ConfigDict(from_attributes=True)

class ProductCreate(ProductBase):
    store_id: int
    attributes: Optional[List[dict]] = None
    variants: Optional[List[dict]] = None
    # Update images to accept a list of objects instead of just strings
    product_images: Optional[List[ProductImageBase]] = None

class ProductUpdate(BaseModel):
    """Schema for partial product updates - all fields optional"""
    product_name: Optional[str] = None
    product_desc: Optional[str] = None
    product_price: Optional[float] = None
    category_id: Optional[int] = None
    image_url: Optional[str] = None
    sku: Optional[str] = None
    stock_quantity: Optional[int] = None
    status: Optional[str] = None
    custom_options: Optional[str] = None
    weight: Optional[float] = None
    tax_class: Optional[str] = None
    url_key: Optional[str] = None
    meta_title: Optional[str] = None
    meta_desc: Optional[str] = None
    visibility: Optional[str] = None
    manage_stock: Optional[bool] = None
    stock_availability: Optional[str] = None

class VariantItemCreate(BaseModel):
    product_id: int
    variant_name: str
    price_adjustment: float


class TimeSlot(BaseModel):
    slot_id: int
    start_time: time
    end_time: time
    available_service: bool
    service_id: int

class AppointmentCreate(BaseModel):
    store_id: int
    barber_name: str
    service_name: str
    booking_date: Optional[datetime] = None

class Appointment(BaseModel):
    appointment_id: int
    booking_date: datetime
    customer_id: int
    store_id: int
    barber_name: Optional[str] = None
    service_name: Optional[str] = None
    customer_name: Optional[str] = None
    status: str

    model_config = ConfigDict(from_attributes=True)

class ReviewCreate(BaseModel):
    store_id: int
    barber_name: Optional[str] = None
    rating: int
    comment: Optional[str] = None

class Review(BaseModel):
    review_id: int
    customer_id: int
    customer_name: Optional[str] = None
    store_id: int
    barber_name: Optional[str] = None
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Dashboard Data Schemas ---

class AdminDashboardData(BaseModel):
    total_vendors: int
    total_customers: int
    total_orders: int
    recent_logs: List[dict]
    orders_graph: List[dict]  # Defaults to Daily
    users_graph: List[dict]   # Defaults to Daily
    orders_graph_weekly: List[dict] = []
    orders_graph_monthly: List[dict] = []
    users_graph_weekly: List[dict] = []
    users_graph_monthly: List[dict] = []

class VendorDashboardData(BaseModel):
    store_info: Store
    products: List[Product]
    recent_orders: List[Order]
    appointments: List[Appointment]
    customers: List[Customer] = []

class CustomerDashboardData(BaseModel):
    profile: Customer
    active_orders: List[Order]
    upcoming_appointments: List[Appointment]
    available_stores: List[Store]

class MessageBase(BaseModel):
    content: Optional[str] = None
    receiver_id: int
    message_type: Optional[str] = "text"
    attachment_url: Optional[str] = None
    reply_to_id: Optional[int] = None

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    sender_id: int
    timestamp: datetime
    is_read: bool

    model_config = ConfigDict(from_attributes=True)

class NotificationBase(BaseModel):
    title: str
    message: str
    type: str 
    related_id: Optional[int] = None

class NotificationCreate(NotificationBase):
    user_id: int

class Notification(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
