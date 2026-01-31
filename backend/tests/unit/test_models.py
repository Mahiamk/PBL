"""
Unit tests for SQLAlchemy models.
"""
import pytest
from datetime import datetime
from decimal import Decimal

from app.models.models import (
    User, UserRole, UserStatus,
    Store, Product, Category, Service,
    Order, OrderItem, PaymentMethod, OrderHistory,
    Appointment, TimeSlot, ServiceProvider,
    SystemLog, Review, Message, Notification
)


class TestUserModel:
    """Unit tests for User model."""

    def test_user_creation(self, db_session):
        """Test basic user creation with 3NF normalized name fields."""
        user = User(
            email="test@example.com",
            hashed_password="hashedpassword",
            first_name="Test",
            last_name="User",
            initial=None,
            role=UserRole.CUSTOMER,
            status=UserStatus.active
        )
        db_session.add(user)
        db_session.commit()
        
        assert user.id is not None
        assert user.email == "test@example.com"
        assert user.role == UserRole.CUSTOMER
        assert user.first_name == "Test"
        assert user.last_name == "User"
        # Test computed property
        assert user.full_name == "Test User"
        assert user.is_active is True

    def test_user_full_name_computed_property(self, db_session):
        """Test that full_name is computed correctly from first_name, initial, last_name."""
        user = User(
            email="middle@example.com",
            hashed_password="hashedpassword",
            first_name="John",
            last_name="Doe",
            initial="M.",
            role=UserRole.CUSTOMER,
            status=UserStatus.active
        )
        db_session.add(user)
        db_session.commit()
        
        assert user.full_name == "John M. Doe"

    def test_user_is_active_computed_from_status(self, db_session):
        """Test that is_active is computed correctly from status."""
        user = User(
            email="inactive@example.com",
            hashed_password="hashedpassword",
            first_name="Inactive",
            last_name="User",
            role=UserRole.CUSTOMER,
            status="deleted"
        )
        db_session.add(user)
        db_session.commit()
        
        assert user.is_active is False

    def test_user_role_enum(self):
        """Test UserRole enum values."""
        assert UserRole.ADMIN.value == "admin"
        assert UserRole.VENDOR.value == "vendor"
        assert UserRole.CUSTOMER.value == "customer"

    def test_user_status_enum(self):
        """Test UserStatus enum values."""
        assert UserStatus.active.value == "active"
        assert UserStatus.PENDING.value == "pending"
        assert UserStatus.REJECTED.value == "rejected"


class TestStoreModel:
    """Unit tests for Store model."""

    def test_store_creation(self, db_session):
        """Test basic store creation."""
        store = Store(store_name="My Store", store_type="barber")
        db_session.add(store)
        db_session.commit()
        
        assert store.store_id is not None
        assert store.store_name == "My Store"
        assert store.store_type == "barber"


class TestProductModel:
    """Unit tests for Product model."""

    def test_product_creation(self, db_session, test_store, test_category):
        """Test basic product creation."""
        product = Product(
            product_name="Test Product",
            product_desc="Description",
            product_price=Decimal("19.99"),
            stock_quantity=50,
            status="active",
            store_id=test_store.store_id,
            category_id=test_category.category_id
        )
        db_session.add(product)
        db_session.commit()
        
        assert product.product_id is not None
        assert product.product_name == "Test Product"
        assert product.product_price == Decimal("19.99")

    def test_product_store_relationship(self, db_session, test_store, test_category):
        """Test product-store relationship."""
        product = Product(
            product_name="Test Product",
            product_price=Decimal("29.99"),
            store_id=test_store.store_id,
            category_id=test_category.category_id
        )
        db_session.add(product)
        db_session.commit()
        db_session.refresh(product)
        
        assert product.store is not None
        assert product.store.store_name == test_store.store_name


class TestOrderModel:
    """Unit tests for Order model."""

    def test_order_creation(self, db_session, test_store, test_user):
        """Test basic order creation."""
        order = Order(
            customer_id=test_user.id,
            store_id=test_store.store_id,
            total_amount=Decimal("99.99"),
            status="Processing",
            customer_name=test_user.full_name
        )
        db_session.add(order)
        db_session.commit()
        
        assert order.order_id is not None
        assert order.status == "Processing"

    def test_order_payment_method_property(self, db_session, test_store, test_user):
        """Test order payment_method property."""
        # Create payment method
        pm = PaymentMethod(method_name="Online Payment")
        db_session.add(pm)
        db_session.commit()
        
        order = Order(
            customer_id=test_user.id,
            store_id=test_store.store_id,
            total_amount=Decimal("50.00"),
            payment_method_id=pm.payment_method_id
        )
        db_session.add(order)
        db_session.commit()
        db_session.refresh(order)
        
        # Test the backward compatibility property
        assert order.payment_method == "Online Payment"


class TestSystemLogModel:
    """Unit tests for SystemLog model."""

    def test_system_log_creation(self, db_session, test_user):
        """Test system log creation."""
        log = SystemLog(
            action="Login Success",
            customer_id=test_user.id
        )
        db_session.add(log)
        db_session.commit()
        
        assert log.log_id is not None
        assert log.action == "Login Success"
        assert log.timestamp is not None


class TestServiceProviderModel:
    """Unit tests for ServiceProvider model."""

    def test_service_provider_creation(self, db_session, test_store):
        """Test service provider creation."""
        provider = ServiceProvider(
            name="John Barber",
            contact="123-456-7890",
            store_id=test_store.store_id
        )
        db_session.add(provider)
        db_session.commit()
        
        assert provider.provider_id is not None
        assert provider.name == "John Barber"
        assert provider.contact == "123-456-7890"


class TestTimeSlotModel:
    """Unit tests for TimeSlot model."""

    def test_time_slot_creation(self, db_session, test_store):
        """Test time slot creation."""
        service = Service(
            service_name="Haircut",
            service_price=Decimal("25.00"),
            store_id=test_store.store_id
        )
        db_session.add(service)
        db_session.commit()
        
        from datetime import datetime, timedelta
        start = datetime.now()
        end = start + timedelta(hours=1)
        
        slot = TimeSlot(
            start_time=start,
            end_time=end,
            service_id=service.service_id
        )
        db_session.add(slot)
        db_session.commit()
        
        assert slot.slot_id is not None
        assert slot.service_id == service.service_id
