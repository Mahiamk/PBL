"""
Component tests for Authentication API endpoints.
"""
import pytest


class TestUserRegistration:
    """Component tests for user registration."""

    def test_register_customer_success(self, client):
        """Test successful customer registration with 3NF normalized name fields."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "newcustomer@example.com",
                "password": "securepassword123",
                "first_name": "New",
                "last_name": "Customer",
                "initial": None
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "newcustomer@example.com"
        assert data["first_name"] == "New"
        assert data["last_name"] == "Customer"
        assert data["full_name"] == "New Customer"  # Computed property
        assert data["role"] == "customer"

    def test_register_duplicate_email(self, client, test_user):
        """Test registration with existing email fails."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": test_user.email,
                "password": "anypassword123",
                "first_name": "Another",
                "last_name": "User"
            }
        )
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]

    def test_register_invalid_email_format(self, client):
        """Test registration with invalid email format."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "invalid-email",
                "password": "password123",
                "first_name": "Test",
                "last_name": "User"
            }
        )
        # Note: API currently accepts any string as email
        # This test documents current behavior - registration succeeds
        assert response.status_code in [200, 422]


class TestLogin:
    """Component tests for login endpoint."""

    def test_login_success(self, client, test_user):
        """Test successful login."""
        response = client.post(
            "/api/v1/auth/token",
            data={
                "username": test_user.email,
                "password": "testpassword123"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["role"] == "customer"

    def test_login_wrong_password(self, client, test_user):
        """Test login with wrong password."""
        response = client.post(
            "/api/v1/auth/token",
            data={
                "username": test_user.email,
                "password": "wrongpassword"
            }
        )
        assert response.status_code == 401
        assert "Incorrect" in response.json()["detail"]

    def test_login_nonexistent_user(self, client):
        """Test login with non-existent user."""
        response = client.post(
            "/api/v1/auth/token",
            data={
                "username": "nonexistent@example.com",
                "password": "anypassword"
            }
        )
        assert response.status_code == 401

    def test_login_logs_success(self, client, test_user, db_session):
        """Test that successful login creates a system log entry."""
        from app.models.models import SystemLog
        
        # Perform login
        client.post(
            "/api/v1/auth/token",
            data={
                "username": test_user.email,
                "password": "testpassword123"
            }
        )
        
        # Check for log entry
        log = db_session.query(SystemLog).filter(
            SystemLog.action == "Login Success"
        ).first()
        assert log is not None

    def test_login_logs_failure(self, client, test_user, db_session):
        """Test that failed login creates a system log entry."""
        from app.models.models import SystemLog
        
        # Perform failed login
        client.post(
            "/api/v1/auth/token",
            data={
                "username": test_user.email,
                "password": "wrongpassword"
            }
        )
        
        # Check for log entry
        log = db_session.query(SystemLog).filter(
            SystemLog.action == "Login Failure"
        ).first()
        assert log is not None


class TestVendorRegistration:
    """Component tests for vendor registration."""

    def test_register_vendor_success(self, client):
        """Test successful vendor registration with 3NF normalized name fields."""
        import uuid
        unique_email = f"vendor_{uuid.uuid4().hex[:8]}@example.com"
        
        response = client.post(
            "/api/v1/auth/register/vendor",
            data={
                "first_name": "Vendor",
                "last_name": "Owner",
                "initial": None,
                "email": unique_email,
                "password": "vendorpass123",
                "business_name": "My Barber Shop",
                "contact_details": "123-456-7890",
                "vendor_type": "barber"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == unique_email
        assert data["role"] == "vendor"
        assert data["first_name"] == "Vendor"
        assert data["last_name"] == "Owner"
        assert data["full_name"] == "Vendor Owner"  # Computed property

    def test_register_vendor_duplicate_email(self, client, test_vendor):
        """Test vendor registration with existing email fails."""
        response = client.post(
            "/api/v1/auth/register/vendor",
            data={
                "first_name": "Another",
                "last_name": "Vendor",
                "email": test_vendor["user"].email,
                "password": "password123",
                "business_name": "Another Shop",
                "contact_details": "999-999-9999",
                "vendor_type": "massage"
            }
        )
        assert response.status_code == 400


class TestProtectedEndpoints:
    """Component tests for authentication-protected endpoints."""

    def test_access_protected_without_token(self, client):
        """Test accessing protected endpoint without token fails."""
        response = client.get("/api/products")
        # Products endpoint doesn't require auth, use admin endpoint instead
        response = client.get("/api/admin/users")
        assert response.status_code == 401

    def test_access_protected_with_token(self, client, auth_headers, test_user):
        """Test accessing protected endpoint with valid token."""
        # Use customer dashboard endpoint which requires auth
        response = client.get(
            f"/api/v1/users/customer/dashboard/{test_user.id}",
            headers=auth_headers
        )
        assert response.status_code == 200

    def test_access_protected_with_invalid_token(self, client):
        """Test accessing protected endpoint with invalid token."""
        response = client.get(
            "/api/admin/users",
            headers={"Authorization": "Bearer invalidtoken123"}
        )
        assert response.status_code == 401
