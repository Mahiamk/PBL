from app.schemas.schemas import SubscriberBase


def test_subscriber_schema_accepts_valid_email():
    subscriber = SubscriberBase(email="user@example.com")
    assert subscriber.email == "user@example.com"
