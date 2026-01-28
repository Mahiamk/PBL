# Test Suite Documentation

This directory contains comprehensive tests for the PBL platform.

## Test Structure

```
tests/
├── conftest.py              # Shared fixtures and test configuration
├── unit/                    # Unit tests
│   ├── test_security.py     # Password hashing and JWT tests
│   └── test_models.py       # SQLAlchemy model tests
└── component/               # Component/Integration tests
    ├── test_auth.py         # Authentication endpoint tests
    ├── test_products.py     # Product CRUD tests
    ├── test_orders.py       # Order management tests (3NF compatible)
    ├── test_appointments.py # Appointment tests (normalized schema)
    └── test_admin.py        # Admin endpoint tests
```

## Running Tests

### Install Test Dependencies

```bash
pip install pytest pytest-asyncio httpx
```

### Run All Tests

```bash
cd backend
pytest
```

### Run with Verbose Output

```bash
pytest -v
```

### Run Specific Test File

```bash
pytest tests/unit/test_security.py
```

### Run Tests with Coverage

```bash
pip install pytest-cov
pytest --cov=app --cov-report=html
```

## Test Categories

### Unit Tests

Test individual functions and utilities in isolation:

- **test_security.py**: Password hashing (`get_password_hash`, `verify_password`) and JWT token creation/verification
- **test_models.py**: SQLAlchemy model creation, relationships, and properties

### Component Tests

Test API endpoints with database interactions:

- **test_auth.py**: User registration, login, token validation, protected routes
- **test_products.py**: Product CRUD, category management, vendor operations
- **test_orders.py**: Order creation, status updates, payment methods (3NF normalized)
- **test_appointments.py**: Appointment booking with normalized TIME_SLOT and SERVICE_PROVIDER tables
- **test_admin.py**: Admin operations, system logs, user management

## Test Database

Tests use an in-memory SQLite database (`sqlite:///:memory:`) to:
- Avoid affecting production data
- Enable fast test execution
- Ensure test isolation

## Fixtures

Common fixtures defined in `conftest.py`:

| Fixture | Description |
|---------|-------------|
| `db_session` | Database session with test tables |
| `client` | FastAPI TestClient |
| `test_user` | Sample customer user |
| `test_vendor` | Sample vendor user with store |
| `test_admin` | Sample admin user |
| `auth_headers` | Function to generate auth headers |

## Notes on Normalized Schema Testing

Tests are designed to work with the normalized database schema:

- **Orders**: Tests verify backward compatibility with `payment_method` as string while internally using PAYMENT_METHOD table
- **Appointments**: Tests verify `barber_name`, `service_name`, and `booking_date` properties work correctly with underlying SERVICE_PROVIDER and TIME_SLOT tables



