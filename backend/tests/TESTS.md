# Test Suite Documentation & History

## Overview

This document tracks the testing history, challenges encountered, and solutions implemented for the PBL platform backend test suite.

---

## Test Suite Statistics

| Date | Passed | Failed | Total | Pass Rate | Notes |
|------|--------|--------|-------|-----------|-------|
| 2026-01-20 (Initial) | 53 | 22 | 75 | 70.7% | Initial test suite creation |
| 2026-01-21 (After Fixes) | 65 | 10 | 75 | 86.7% | Fixed route prefixes |
| 2026-01-24 (All Fixed) | 75 | 0 | 75 | 100% | All tests passing, 0 warnings |
| 2026-01-25 (3NF Update) | 77 | 0 | 77 | 100% | User table normalized to 3NF |

---

## Test History Timeline

### Phase 1: Initial Test Suite Creation
- Created comprehensive test structure with `conftest.py`, unit tests, and component tests
- Established fixtures for users, vendors, admins, stores, and auth headers
- Initial run: 53 passed, 22 failed

### Phase 2: Debugging & Fixing Failures
1. **Pydantic V2 Migration** - Converted all `class Config` to `model_config = ConfigDict()`
2. **Route Prefix Fixes** - Corrected `/api/v1/admin` to `/api/admin`
3. **Schema Fixes** - Created `ProductUpdate` schema for partial updates
4. **SQLAlchemy Fix** - Updated deprecated import path
5. **Auth Test Fixes** - Fixed vendor registration and protected endpoint tests

### Phase 3: 3NF Normalization
- Normalized User table: `full_name` → `first_name`, `last_name`, `initial`
- Removed redundant `is_active` column (computed from `status`)
- Added 2 new tests for computed properties
- Final: 77 tests, 100% pass rate

---

## Foundational Testing

### Test Framework Setup

- **Framework**: pytest with FastAPI TestClient
- **Database**: In-memory SQLite (`sqlite:///:memory:`) with StaticPool for test isolation
- **Coverage**: pytest-cov for coverage reporting

### Test Structure

```
tests/
├── conftest.py              # Shared fixtures and test configuration
├── unit/                    # Unit tests (isolated function testing)
│   ├── test_security.py     # Password hashing, JWT token tests
│   └── test_models.py       # SQLAlchemy model tests
└── component/               # Component tests (API endpoint testing)
    ├── test_auth.py         # Authentication endpoint tests
    ├── test_products.py     # Product CRUD tests
    ├── test_orders.py       # Order management tests
    ├── test_appointments.py # Appointment booking tests
    └── test_admin.py        # Admin endpoint tests
```

### Key Fixtures (conftest.py)

| Fixture | Description |
|---------|-------------|
| `db_session` | Fresh database session for each test with automatic cleanup |
| `client` | FastAPI TestClient with database override |
| `test_user` | Sample customer user (role: CUSTOMER) |
| `test_vendor` | Sample vendor user with associated store |
| `test_admin` | Sample admin user (role: ADMIN) |
| `auth_headers` | JWT auth headers for customer |
| `admin_auth_headers` | JWT auth headers for admin |
| `vendor_auth_headers` | JWT auth headers for vendor |

---

## Challenges & Solutions

### Challenge 1: Pydantic V2 Deprecation Warnings

**Problem**: Multiple deprecation warnings appeared during test runs:
```
PydanticDeprecatedSince20: Support for class-based `config` is deprecated, 
use ConfigDict instead.
```

**Affected Files**:
- `app/schemas/schemas.py` (13 occurrences)
- `app/schemas/auth.py` (2 occurrences)
- `app/api/v1/services.py` (1 occurrence)

**Solution**: Migrated all Pydantic models from class-based Config to ConfigDict:

```python
# Before (deprecated)
class MyModel(BaseModel):
    field: str
    
    class Config:
        from_attributes = True

# After (Pydantic V2 compliant)
from pydantic import BaseModel, ConfigDict

class MyModel(BaseModel):
    field: str
    
    model_config = ConfigDict(from_attributes=True)
```

**Result**: Reduced warnings from 16 to 1 (only SQLAlchemy deprecation remains)

---

### Challenge 2: pytest Collection Error (test_api.py)

**Problem**: pytest failed during collection with error in `test_api.py`:
```
ERROR test_api.py
Interrupted: 1 error during collection
```

**Root Cause**: A standalone debug script named `test_api.py` in the backend root was being collected by pytest as a test file, but it wasn't a valid pytest module.

**Solution**: Renamed the file to `debug_api.py` to prevent pytest collection:
```bash
mv backend/test_api.py backend/debug_api.py
```

**Result**: pytest now collects and runs all 75 tests without collection errors

---

### Challenge 3: 422 Unprocessable Entity on Product Update

**Problem**: `test_update_product` failed with 422 error:
```
assert 422 in [200, 403]
```

**Root Cause**: The `PUT /api/products/{id}` endpoint used `ProductCreate` schema which requires all fields (including `store_id`). The test only sent partial data:
```python
json={"product_name": "Updated", "product_price": 39.99}
```

**Solution**: Created a new `ProductUpdate` schema with all optional fields for partial updates:

```python
class ProductUpdate(BaseModel):
    """Schema for partial product updates - all fields optional"""
    product_name: Optional[str] = None
    product_desc: Optional[str] = None
    product_price: Optional[float] = None
    # ... all other fields as Optional
```

Updated the API endpoint to only modify provided fields:
```python
@router.put("/{product_id}", response_model=Product)
def update_product(product_id: int, product_update: ProductUpdate, ...):
    if product_update.product_name is not None:
        product.product_name = product_update.product_name
    # ... only update non-None fields
```

**Result**: `test_update_product` now passes; partial updates work correctly

---

### Challenge 4: Admin Tests 404 Not Found

**Problem**: All 11 admin tests failed with 404 errors:
```
assert 404 == 200
```

**Root Cause**: Tests used wrong API route prefix. Tests called `/api/v1/admin/users` but the actual route was `/api/admin/users`.

**Evidence from main.py**:
```python
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
```

**Solution**: Updated all routes in `test_admin.py` from `/api/v1/admin/*` to `/api/admin/*`:
```python
# Before
response = client.get("/api/v1/admin/users", headers=admin_auth_headers)

# After
response = client.get("/api/admin/users", headers=admin_auth_headers)
```

**Result**: All 11 admin tests now pass

---

## Test Categories Explained

### Unit Tests

Test individual functions in complete isolation:

| Test File | Coverage |
|-----------|----------|
| `test_security.py` | `get_password_hash()`, `verify_password()`, `create_access_token()` |
| `test_models.py` | User, Store, Product, Order, SystemLog, ServiceProvider, TimeSlot models |

### Component Tests

Test API endpoints with database interactions:

| Test File | Coverage |
|-----------|----------|
| `test_auth.py` | Registration, login, token validation, protected routes |
| `test_products.py` | Product CRUD, categories, image upload |
| `test_orders.py` | Order creation, status updates, payment methods (3NF) |
| `test_appointments.py` | Booking with normalized ServiceProvider/TimeSlot tables |
| `test_admin.py` | User management, vendor applications, system logs |

---

## Normalized Schema Testing

Tests verify backward compatibility with the normalized database schema:

### Orders (3NF Normalization)

- `PAYMENT_METHOD` table stores payment method names
- `ORDER_HISTORY` table tracks status changes
- Tests verify `payment_method` property returns string (backward compatible)

### Appointments (Service Normalization)

- `SERVICE_PROVIDER` table stores barber/provider info
- `TIME_SLOT` table stores booking time ranges
- Tests verify `barber_name`, `service_name`, `booking_date` properties work correctly

---

## Running Tests

### All Tests
```bash
cd backend && pytest -v
```

### Specific Test File
```bash
pytest tests/component/test_admin.py -v
```

### With Coverage
```bash
pytest --cov=app --cov-report=html
```

### Suppress Warnings
```bash
pytest -v --disable-warnings
```

---

## Remaining Issues (10 Failing Tests)

As of 2026-01-26, the following tests require API route alignment:

| Test File | Failing Tests | Likely Issue |
|-----------|---------------|--------------|
| `test_auth.py` | 5 tests | Route prefix mismatch or validation differences |
| `test_orders.py` | 5 tests | Route prefix or schema differences |

These failures are due to test expectations not matching actual API implementation, not code bugs.

**UPDATE**: All issues have been resolved. Final test count: **77 passed, 0 failed**.

---

## Challenge 5: SQLAlchemy Deprecation Warning

**Problem**: Deprecation warning during test runs:
```
MovedIn20Warning: The `declarative_base()` function is now available as 
sqlalchemy.orm.declarative_base()
```

**Solution**: Updated import in `app/db/database.py`:
```python
# Before (deprecated)
from sqlalchemy.ext.declarative import declarative_base

# After (SQLAlchemy 2.0 compliant)
from sqlalchemy.orm import declarative_base
```

**Result**: All deprecation warnings eliminated (0 warnings)

---

## Challenge 6: User Table 3NF Normalization

**Problem**: User table violated 3NF with redundant data:
1. `full_name` column stored composite data (first + middle + last name)
2. `is_active` boolean was redundant with `status` string field

**Solution**: Normalized the User table:

### Schema Changes
```python
# Before (not normalized)
class User(Base):
    full_name = Column(String(255))
    is_active = Column(Boolean(), default=True)
    status = Column(String(50), default="active")

# After (3NF normalized)
class User(Base):
    first_name = Column("FIRST_NAME", String(100))
    last_name = Column("LAST_NAME", String(100))
    initial = Column("INITIAL", String(10), nullable=True)  # Middle initial
    status = Column(String(50), default="active")
    
    @property
    def full_name(self):
        """Computed full name for backward compatibility"""
        parts = [self.first_name, self.initial, self.last_name]
        return " ".join(filter(None, parts)) or None
    
    @property
    def is_active(self):
        """Computed from status for backward compatibility"""
        return self.status == "active"
```

### Files Updated
| Category | Files |
|----------|-------|
| **Model** | `app/models/models.py` |
| **Schemas** | `app/schemas/auth.py` (UserCreate, UserResponse with @computed_field) |
| **API Endpoints** | `auth.py`, `admin.py`, `users.py`, `messages.py`, `deps.py` |
| **Scripts** | `seed_db.py`, `create_admin.py` |
| **Tests** | `conftest.py`, `test_models.py`, `test_auth.py`, `test_admin.py` |
| **Frontend** | `Register.jsx`, `VendorRegister.jsx` |

### New Tests Added
```python
def test_user_full_name_computed_property(self, db_session):
    """Test that full_name is computed correctly from first_name, initial, last_name."""
    user = User(first_name="John", last_name="Doe", initial="M.", ...)
    assert user.full_name == "John M. Doe"

def test_user_is_active_computed_from_status(self, db_session):
    """Test that is_active is computed correctly from status."""
    user = User(status="deleted", ...)
    assert user.is_active is False
```

**Result**: 
- User table now in 3NF
- Backward compatibility maintained via computed properties
- Tests increased from 75 → 77
- All tests passing (100%)

---

## Best Practices Established

1. **Test Isolation**: Each test gets a fresh database session
2. **Fixture Reuse**: Common entities (users, stores) defined as fixtures
3. **Backward Compatibility**: Tests verify normalized schema returns expected legacy fields
4. **Route Verification**: Always check `main.py` for actual route prefixes before writing tests
5. **Schema Validation**: Use appropriate schemas for create vs update operations
6. **Computed Properties**: Use `@property` decorators for backward-compatible derived values
7. **Pydantic Computed Fields**: Use `@computed_field` for schema response compatibility

---

## Current Test Coverage Summary

### Unit Tests (19 tests)
| Test Class | Tests | Description |
|------------|-------|-------------|
| `TestUserModel` | 5 | User creation, computed properties (full_name, is_active), enums |
| `TestStoreModel` | 1 | Store creation |
| `TestProductModel` | 2 | Product creation, store relationship |
| `TestOrderModel` | 2 | Order creation, payment_method property |
| `TestSystemLogModel` | 1 | System log creation |
| `TestServiceProviderModel` | 1 | Service provider creation |
| `TestTimeSlotModel` | 1 | Time slot creation |
| `TestPasswordHashing` | 6 | Password hash/verify functions |
| `TestJWTToken` | 5 | Token creation and validation |

### Component Tests (58 tests)
| Test Class | Tests | Description |
|------------|-------|-------------|
| `TestAdminUserManagement` | 3 | Get users (admin/customer/no auth) |
| `TestVendorApplicationManagement` | 3 | Get/approve/reject applications |
| `TestSystemLogStats` | 3 | Stats retrieval and access control |
| `TestUserDeletion` | 2 | Soft delete user tests |
| `TestAppointmentCreation` | 3 | Create appointment scenarios |
| `TestAppointmentRetrieval` | 2 | Get appointments |
| `TestAppointmentCancellation` | 2 | Cancel appointment tests |
| `TestNormalizedAppointmentData` | 1 | Backward compatibility |
| `TestUserRegistration` | 3 | Customer registration (3NF) |
| `TestLogin` | 5 | Login scenarios and logging |
| `TestVendorRegistration` | 2 | Vendor registration (3NF) |
| `TestProtectedEndpoints` | 3 | Auth token validation |
| `TestOrderCreation` | 3 | Order creation scenarios |
| `TestOrderRetrieval` | 2 | Dashboard and order retrieval |
| `TestOrderStatusUpdate` | 2 | Status update and history |
| `TestOrderPaymentMethod` | 1 | Payment method normalization |
| `TestCategoryEndpoints` | 5 | Category CRUD |
| `TestProductEndpoints` | 7 | Product CRUD |
| `TestProductImageUpload` | 1 | Image upload |

**Total: 77 tests | Pass Rate: 100% | Warnings: 0**
