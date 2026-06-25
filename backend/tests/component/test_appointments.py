"""
Component tests for Appointments API endpoints (with normalization).
"""
import pytest
from datetime import datetime, timedelta


class TestAppointmentCreation:
    """Component tests for appointment creation."""

    def test_create_appointment_success(self, client, auth_headers, db_session, test_store):
        """Test successful appointment creation."""
        from app.models.models import Service
        
        # Create a service first
        service = Service(
            service_name="Haircut",
            service_price=25.00,
            store_id=test_store.store_id,
            status="active"
        )
        db_session.add(service)
        db_session.commit()
        
        booking_date = (datetime.now() + timedelta(days=2)).isoformat()
        
        response = client.post(
            "/api/appointments/",
            json={
                "store_id": test_store.store_id,
                "barber_name": "John",
                "service_name": "Haircut",
                "booking_date": booking_date
            },
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "Pending"
        # Backward compatibility - should still return barber_name
        assert "barber_name" in data

    def test_create_appointment_without_auth(self, client, test_store):
        """Test appointment creation without authentication fails."""
        booking_date = (datetime.now() + timedelta(days=2)).isoformat()
        
        response = client.post(
            "/api/appointments/",
            json={
                "store_id": test_store.store_id,
                "barber_name": "John",
                "service_name": "Haircut",
                "booking_date": booking_date
            }
        )
        assert response.status_code == 401

    def test_create_duplicate_appointment_fails(self, client, auth_headers, db_session, test_store):
        """Test creating duplicate appointment at same time fails."""
        from app.models.models import Service
        
        service = Service(
            service_name="Shave",
            service_price=15.00,
            store_id=test_store.store_id
        )
        db_session.add(service)
        db_session.commit()
        
        booking_date = (datetime.now() + timedelta(days=3)).isoformat()
        
        # First appointment
        response1 = client.post(
            "/api/appointments/",
            json={
                "store_id": test_store.store_id,
                "barber_name": "Mike",
                "service_name": "Shave",
                "booking_date": booking_date
            },
            headers=auth_headers
        )
        
        # Second appointment at same time with same barber
        response2 = client.post(
            "/api/appointments/",
            json={
                "store_id": test_store.store_id,
                "barber_name": "Mike",
                "service_name": "Shave",
                "booking_date": booking_date
            },
            headers=auth_headers
        )
        
        # First should succeed, second should fail
        assert response1.status_code == 200
        assert response2.status_code == 400


class TestAppointmentRetrieval:
    """Component tests for appointment retrieval."""

    def test_get_my_appointments(self, client, auth_headers):
        """Test getting user's appointments."""
        response = client.get("/api/appointments/my-appointments", headers=auth_headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_store_appointments(self, client, auth_headers, test_store):
        """Test getting store's appointments."""
        response = client.get(
            f"/api/appointments/store/{test_store.store_id}",
            headers=auth_headers
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)


class TestAppointmentCancellation:
    """Component tests for appointment cancellation."""

    def test_cancel_appointment_success(self, client, auth_headers, db_session, test_store, test_user):
        """Test successful appointment cancellation (>24h notice)."""
        from app.models.models import Appointment, Service, ServiceProvider, TimeSlot
        
        # Create normalized structure
        service = Service(service_name="Test", service_price=20.00, store_id=test_store.store_id)
        db_session.add(service)
        db_session.commit()
        
        provider = ServiceProvider(name="Barber", store_id=test_store.store_id)
        db_session.add(provider)
        db_session.commit()
        
        future_time = datetime.now() + timedelta(days=3)  # More than 24h
        slot = TimeSlot(
            start_time=future_time,
            end_time=future_time + timedelta(hours=1),
            service_id=service.service_id
        )
        db_session.add(slot)
        db_session.commit()
        
        appointment = Appointment(
            customer_id=test_user.id,
            store_id=test_store.store_id,
            provider_id=provider.provider_id,
            slot_id=slot.slot_id,
            status="Confirmed"
        )
        db_session.add(appointment)
        db_session.commit()
        
        response = client.put(
            f"/api/appointments/{appointment.appointment_id}/cancel",
            headers=auth_headers
        )
        assert response.status_code == 200
        assert response.json()["status"] == "Cancelled"

    def test_cancel_appointment_within_24h_fails(self, client, auth_headers, db_session, test_store, test_user):
        """Test cancellation within 24h fails due to penalty policy."""
        from app.models.models import Appointment, Service, ServiceProvider, TimeSlot
        
        service = Service(service_name="Test", service_price=20.00, store_id=test_store.store_id)
        db_session.add(service)
        db_session.commit()
        
        provider = ServiceProvider(name="Barber", store_id=test_store.store_id)
        db_session.add(provider)
        db_session.commit()
        
        # Less than 24h from now
        soon_time = datetime.now() + timedelta(hours=12)
        slot = TimeSlot(
            start_time=soon_time,
            end_time=soon_time + timedelta(hours=1),
            service_id=service.service_id
        )
        db_session.add(slot)
        db_session.commit()
        
        appointment = Appointment(
            customer_id=test_user.id,
            store_id=test_store.store_id,
            provider_id=provider.provider_id,
            slot_id=slot.slot_id,
            status="Confirmed"
        )
        db_session.add(appointment)
        db_session.commit()
        
        response = client.put(
            f"/api/appointments/{appointment.appointment_id}/cancel",
            headers=auth_headers
        )
        assert response.status_code == 400
        assert "24 hours" in response.json()["detail"]


class TestNormalizedAppointmentData:
    """Component tests for normalized appointment schema."""

    def test_appointment_returns_backward_compatible_fields(self, client, auth_headers, db_session, test_store, test_user):
        """Test that normalized appointment returns legacy field names."""
        from app.models.models import Appointment, Service, ServiceProvider, TimeSlot
        
        service = Service(service_name="Premium Cut", service_price=50.00, store_id=test_store.store_id)
        db_session.add(service)
        db_session.commit()
        
        provider = ServiceProvider(name="Expert Barber", store_id=test_store.store_id)
        db_session.add(provider)
        db_session.commit()
        
        booking_time = datetime.now() + timedelta(days=5)
        slot = TimeSlot(
            start_time=booking_time,
            end_time=booking_time + timedelta(hours=1),
            service_id=service.service_id
        )
        db_session.add(slot)
        db_session.commit()
        
        appointment = Appointment(
            customer_id=test_user.id,
            customer_name=test_user.full_name,
            store_id=test_store.store_id,
            provider_id=provider.provider_id,
            slot_id=slot.slot_id,
            status="Confirmed"
        )
        db_session.add(appointment)
        db_session.commit()
        
        response = client.get("/api/appointments/my-appointments", headers=auth_headers)
        assert response.status_code == 200
        
        appointments = response.json()
        if len(appointments) > 0:
            appt = appointments[-1]
            # Check backward compatibility fields exist
            assert "barber_name" in appt
            assert "booking_date" in appt
            assert "service_name" in appt
