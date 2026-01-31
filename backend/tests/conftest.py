"""
Pytest configuration and fixtures for backend testing.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.database import Base, get_db
from app.core.security import get_password_hash
from app.models.models import User, UserRole, UserStatus, Store, Product, Category, RoleAdmin

# Test database URL (in-memory SQLite for speed)
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override the database dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Seed default roles
    roles = ["admin", "vendor", "customer"]
    for r_name in roles:
        if not db.query(RoleAdmin).filter(RoleAdmin.role_name == r_name).first():
            db.add(RoleAdmin(role_name=r_name))
    db.commit()
    
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database override."""
    app.dependency_overrides[get_db] = lambda: db_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session):
    """Create a test customer user."""
    # Get Customer Role
    role = db_session.query(RoleAdmin).filter(RoleAdmin.role_name == "customer").first()

    # 3NF Normalized: Split name into first_name, last_name, initial
    user = User(
        email="testcustomer@example.com",
        hashed_password=get_password_hash("testpassword123"),
        first_name="Test",
        last_name="Customer",
        initial=None,
        role_id=role.role_id,
        status=UserStatus.active
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_vendor(db_session):
    """Create a test vendor user with store."""
    # Create Store
    store = Store(store_name="Test Store", store_type="barber")
    db_session.add(store)
    db_session.commit()
    db_session.refresh(store)
    
    # Get Vendor Role
    role = db_session.query(RoleAdmin).filter(RoleAdmin.role_name == "vendor").first()

    # Create Vendor User - 3NF Normalized
    user = User(
        email="testvendor@example.com",
        hashed_password=get_password_hash("vendorpassword123"),
        first_name="Test",
        last_name="Vendor",
        initial=None,
        role_id=role.role_id,
        status=UserStatus.active
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    
    return {"user": user, "store": store}


@pytest.fixture
def test_admin(db_session):
    """Create a test admin user."""
    # Get Admin Role
    role = db_session.query(RoleAdmin).filter(RoleAdmin.role_name == "admin").first()

    # 3NF Normalized: Split name into first_name, last_name, initial
    user = User(
        email="admin@example.com",
        hashed_password=get_password_hash("adminpassword123"),
        first_name="Test",
        last_name="Admin",
        initial=None,
        role_id=role.role_id,
        status=UserStatus.active
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_store(db_session):
    """Create a test store."""
    store = Store(store_name="Sample Store", store_type="clothing")
    db_session.add(store)
    db_session.commit()
    db_session.refresh(store)
    return store


@pytest.fixture
def test_category(db_session, test_store):
    """Create a test category."""
    category = Category(
        category_name="Test Category",
        category_type="product",
        store_id=test_store.store_id
    )
    db_session.add(category)
    db_session.commit()
    db_session.refresh(category)
    return category


@pytest.fixture
def test_product(db_session, test_store, test_category):
    """Create a test product."""
    product = Product(
        product_name="Test Product",
        product_desc="A test product description",
        product_price=29.99,
        stock_quantity=100,
        status="active",
        store_id=test_store.store_id,
        category_id=test_category.category_id
    )
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)
    return product


@pytest.fixture
def auth_headers(client, test_user):
    """Get authentication headers for a test user."""
    response = client.post(
        "/api/v1/auth/token",
        data={"username": test_user.email, "password": "testpassword123"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def vendor_auth_headers(client, test_vendor):
    """Get authentication headers for a test vendor."""
    response = client.post(
        "/api/v1/auth/token",
        data={"username": test_vendor["user"].email, "password": "vendorpassword123"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_auth_headers(client, test_admin):
    """Get authentication headers for a test admin."""
    response = client.post(
        "/api/v1/auth/token",
        data={"username": test_admin.email, "password": "adminpassword123"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
