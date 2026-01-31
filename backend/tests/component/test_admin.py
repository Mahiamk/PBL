"""
Component tests for Admin API endpoints.
"""
import pytest


class TestAdminUserManagement:
    """Component tests for admin user management."""

    def test_get_all_users_as_admin(self, client, admin_auth_headers, test_user):
        """Test admin can get all users."""
        response = client.get("/api/admin/users", headers=admin_auth_headers)
        assert response.status_code == 200
        users = response.json()
        assert isinstance(users, list)
        assert len(users) >= 1

    def test_get_all_users_as_customer_fails(self, client, auth_headers):
        """Test customer cannot access admin endpoints."""
        response = client.get("/api/admin/users", headers=auth_headers)
        assert response.status_code == 403

    def test_get_all_users_without_auth_fails(self, client):
        """Test accessing admin endpoints without auth fails."""
        response = client.get("/api/admin/users")
        assert response.status_code == 401


class TestVendorApplicationManagement:
    """Component tests for vendor application management."""

    def test_get_vendor_applications(self, client, admin_auth_headers):
        """Test admin can get vendor applications."""
        response = client.get("/api/admin/vendor-applications", headers=admin_auth_headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_approve_vendor_application(self, client, admin_auth_headers, db_session):
        """Test admin can approve vendor application."""
        from app.models.models import User, UserRole, UserStatus, VendorApplication
        from app.core.security import get_password_hash
        
        # Create pending vendor - 3NF Normalized name fields
        user = User(
            email="pendingvendor@example.com",
            hashed_password=get_password_hash("password"),
            first_name="Pending",
            last_name="Vendor",
            initial=None,
            role=UserRole.VENDOR,
            status=UserStatus.PENDING
        )
        db_session.add(user)
        db_session.commit()
        
        application = VendorApplication(
            user_id=user.id,
            business_name="Pending Shop",
            contact_details="123",
            status="pending",
            vendor_type="barber"
        )
        db_session.add(application)
        db_session.commit()
        
        response = client.put(
            f"/api/admin/vendor-applications/{application.application_id}/approve",
            headers=admin_auth_headers
        )
        assert response.status_code == 200

    def test_reject_vendor_application(self, client, admin_auth_headers, db_session):
        """Test admin can reject vendor application."""
        from app.models.models import User, UserRole, UserStatus, VendorApplication
        from app.core.security import get_password_hash
        
        # 3NF Normalized name fields
        user = User(
            email="rejectvendor@example.com",
            hashed_password=get_password_hash("password"),
            first_name="Reject",
            last_name="Vendor",
            initial=None,
            role=UserRole.VENDOR,
            status=UserStatus.PENDING
        )
        db_session.add(user)
        db_session.commit()
        
        application = VendorApplication(
            user_id=user.id,
            business_name="Reject Shop",
            status="pending"
        )
        db_session.add(application)
        db_session.commit()
        
        response = client.put(
            f"/api/admin/vendor-applications/{application.application_id}/reject",
            headers=admin_auth_headers
        )
        assert response.status_code == 200


class TestSystemLogStats:
    """Component tests for system log statistics endpoint."""

    def test_get_system_log_stats(self, client, admin_auth_headers):
        """Test admin can get system log stats."""
        response = client.get("/api/admin/system-logs/stats", headers=admin_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "success_count" in data
        assert "failure_count" in data
        assert "total_logs" in data

    def test_get_system_log_stats_with_period(self, client, admin_auth_headers):
        """Test system log stats with custom period."""
        response = client.get(
            "/api/admin/system-logs/stats?period=month",
            headers=admin_auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["period"] == "month"

    def test_system_log_stats_as_customer_fails(self, client, auth_headers):
        """Test customer cannot access system log stats."""
        response = client.get("/api/admin/system-logs/stats", headers=auth_headers)
        assert response.status_code == 403


class TestUserDeletion:
    """Component tests for user deletion (soft delete)."""

    def test_delete_user_as_admin(self, client, admin_auth_headers, db_session):
        """Test admin can soft delete a user."""
        from app.models.models import User, UserRole, UserStatus
        from app.core.security import get_password_hash
        
        # 3NF Normalized name fields
        user = User(
            email="todelete@example.com",
            hashed_password=get_password_hash("password"),
            first_name="To",
            last_name="Delete",
            initial=None,
            role=UserRole.CUSTOMER,
            status=UserStatus.active
        )
        db_session.add(user)
        db_session.commit()
        
        response = client.delete(
            f"/api/admin/users/{user.id}",
            headers=admin_auth_headers
        )
        assert response.status_code == 200
        
        # Verify hard delete
        deleted_user = db_session.query(User).filter(User.id == user.id).first()
        assert deleted_user is None

    def test_delete_user_as_customer_fails(self, client, auth_headers, test_user):
        """Test customer cannot delete users."""
        response = client.delete(
            f"/api/admin/users/{test_user.id}",
            headers=auth_headers
        )
        assert response.status_code == 403
