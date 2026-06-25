"""
Unit tests for security module (password hashing, JWT tokens).
"""
import pytest
from datetime import timedelta
from jose import jwt

from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    ALGORITHM
)
from app.core.config import settings


class TestPasswordHashing:
    """Unit tests for password hashing functions."""

    def test_get_password_hash_returns_string(self):
        """Test that password hash returns a string."""
        password = "testpassword123"
        hashed = get_password_hash(password)
        assert isinstance(hashed, str)
        assert len(hashed) > 0

    def test_get_password_hash_is_different_from_plain(self):
        """Test that hashed password is different from plain text."""
        password = "testpassword123"
        hashed = get_password_hash(password)
        assert hashed != password

    def test_same_password_different_hashes(self):
        """Test that same password produces different hashes (bcrypt salting)."""
        password = "testpassword123"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        assert hash1 != hash2  # Due to bcrypt salt

    def test_verify_password_correct(self):
        """Test password verification with correct password."""
        password = "testpassword123"
        hashed = get_password_hash(password)
        assert verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        """Test password verification with incorrect password."""
        password = "testpassword123"
        wrong_password = "wrongpassword"
        hashed = get_password_hash(password)
        assert verify_password(wrong_password, hashed) is False

    def test_verify_password_empty_string(self):
        """Test password verification with empty string."""
        password = "testpassword123"
        hashed = get_password_hash(password)
        assert verify_password("", hashed) is False


class TestJWTToken:
    """Unit tests for JWT token functions."""

    def test_create_access_token_returns_string(self):
        """Test that create_access_token returns a string."""
        token = create_access_token(subject="user@example.com")
        assert isinstance(token, str)
        assert len(token) > 0

    def test_create_access_token_with_expiry(self):
        """Test token creation with custom expiry."""
        expires_delta = timedelta(minutes=15)
        token = create_access_token(
            subject="user@example.com",
            expires_delta=expires_delta
        )
        assert isinstance(token, str)

    def test_token_contains_subject(self):
        """Test that token payload contains correct subject."""
        email = "user@example.com"
        token = create_access_token(subject=email)
        
        # Decode the token to verify
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["sub"] == email

    def test_token_contains_expiry(self):
        """Test that token payload contains expiry claim."""
        token = create_access_token(subject="user@example.com")
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        assert "exp" in payload

    def test_token_with_integer_subject(self):
        """Test token creation with integer subject."""
        user_id = 123
        token = create_access_token(subject=user_id)
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["sub"] == str(user_id)
