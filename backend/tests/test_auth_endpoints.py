import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.orm import Session

from app.core.db import SessionLocal
from app.core.security import hash_password
from app.main import app
from app.models.user import User


@pytest.fixture
def db_session() -> Session:
    """Provide a database session for tests."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.rollback()
        db.close()


@pytest.fixture
def test_user(db_session: Session) -> User:
    """Create a test user in the database."""
    # Clean up any existing test user first
    existing = (
        db_session.query(User).filter(User.email == "test_auth@example.com").first()
    )
    if existing:
        db_session.delete(existing)
        db_session.commit()

    user = User(
        email="test_auth@example.com",
        hashed_password=hash_password("StrongPass123!"),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    yield user

    # Cleanup after test
    db_session.delete(user)
    db_session.commit()


@pytest_asyncio.fixture
async def async_client() -> AsyncClient:
    """Create an async client for testing."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


# ===== Registration Tests =====


@pytest.mark.asyncio
async def test_register_success(async_client: AsyncClient, db_session: Session):
    """Test successful user registration."""
    # Clean up any existing user
    existing = (
        db_session.query(User).filter(User.email == "newuser@example.com").first()
    )
    if existing:
        db_session.delete(existing)
        db_session.commit()

    resp = await async_client.post(
        "/api/v1/auth/register",
        json={"email": "newuser@example.com", "password": "ValidPass123!"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert "expires_in" in data

    # Clean up
    created_user = (
        db_session.query(User).filter(User.email == "newuser@example.com").first()
    )
    if created_user:
        db_session.delete(created_user)
        db_session.commit()


@pytest.mark.asyncio
async def test_register_duplicate_email(async_client: AsyncClient, test_user: User):
    """Test registration with duplicate email."""
    resp = await async_client.post(
        "/api/v1/auth/register",
        json={"email": test_user.email, "password": "AnotherPass123!"},
    )
    assert resp.status_code == 409
    assert "already registered" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_register_weak_password(async_client: AsyncClient):
    """Test registration with weak password."""
    resp = await async_client.post(
        "/api/v1/auth/register",
        json={"email": "weak@example.com", "password": "short"},
    )
    assert resp.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_register_invalid_email(async_client: AsyncClient):
    """Test registration with invalid email format."""
    resp = await async_client.post(
        "/api/v1/auth/register",
        json={"email": "not-an-email", "password": "ValidPass123!"},
    )
    assert resp.status_code == 422  # Validation error


# ===== Login Tests =====


@pytest.mark.asyncio
async def test_login_success(async_client: AsyncClient, test_user: User):
    """Test successful login."""
    resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "StrongPass123!"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert "expires_in" in data


@pytest.mark.asyncio
async def test_login_invalid_password(async_client: AsyncClient, test_user: User):
    """Test login with wrong password."""
    resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "WrongPassword123!"},
    )
    assert resp.status_code == 401
    assert "invalid" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_login_nonexistent_user(async_client: AsyncClient):
    """Test login with non-existent email."""
    resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@example.com", "password": "Password123!"},
    )
    assert resp.status_code == 401
    assert "invalid" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_login_case_insensitive_email(async_client: AsyncClient, test_user: User):
    """Test that login works with different email casing."""
    resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email.upper(), "password": "StrongPass123!"},
    )
    assert resp.status_code == 200


# ===== Token Refresh Tests =====


@pytest.mark.asyncio
async def test_refresh_token_success(async_client: AsyncClient, test_user: User):
    """Test refreshing access token with valid refresh token."""
    # First login to get tokens
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "StrongPass123!"},
    )
    assert login_resp.status_code == 200
    initial_tokens = login_resp.json()

    # Refresh the token
    refresh_resp = await async_client.post(
        "/api/v1/auth/refresh",
        json={
            "access_token": initial_tokens["access_token"],
            "refresh_token": initial_tokens["refresh_token"],
            "token_type": "bearer",
            "expires_in": initial_tokens["expires_in"],
        },
    )
    assert refresh_resp.status_code == 200
    new_tokens = refresh_resp.json()
    assert "access_token" in new_tokens
    assert "refresh_token" in new_tokens
    # New tokens should be different from initial ones
    assert new_tokens["access_token"] != initial_tokens["access_token"]


@pytest.mark.asyncio
async def test_refresh_token_invalid(async_client: AsyncClient):
    """Test refreshing with invalid refresh token."""
    resp = await async_client.post(
        "/api/v1/auth/refresh",
        json={
            "access_token": "invalid.access.token",
            "refresh_token": "invalid.refresh.token",
            "token_type": "bearer",
            "expires_in": 900,
        },
    )
    assert resp.status_code == 401


# ===== Current User Tests =====


@pytest.mark.asyncio
async def test_get_current_user_success(async_client: AsyncClient, test_user: User):
    """Test getting current user info with valid token."""
    # Login to get access token
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "StrongPass123!"},
    )
    assert login_resp.status_code == 200
    tokens = login_resp.json()

    # Get current user info
    resp = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {tokens['access_token']}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == test_user.email
    assert data["id"] == test_user.id


@pytest.mark.asyncio
async def test_get_current_user_unauthorized(async_client: AsyncClient):
    """Test getting current user without authentication."""
    resp = await async_client.get("/api/v1/auth/me")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user_invalid_token(async_client: AsyncClient):
    """Test getting current user with invalid token."""
    resp = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid.token.here"},
    )
    assert resp.status_code == 401


# ===== Logout Tests =====


@pytest.mark.asyncio
async def test_logout_success(async_client: AsyncClient, test_user: User):
    """Test logout endpoint."""
    # Login first
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "StrongPass123!"},
    )
    assert login_resp.status_code == 200
    tokens = login_resp.json()

    # Logout
    resp = await async_client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {tokens['access_token']}"},
    )
    assert resp.status_code == 204


# ===== Email Exists Tests =====


@pytest.mark.asyncio
async def test_email_exists_true(async_client: AsyncClient, test_user: User):
    """Test checking if email exists when it does."""
    resp = await async_client.get(
        f"/api/v1/auth/exists?email={test_user.email}",
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["exists"] is True


@pytest.mark.asyncio
async def test_email_exists_false(async_client: AsyncClient):
    """Test checking if email exists when it doesn't."""
    resp = await async_client.get(
        "/api/v1/auth/exists?email=nonexistent@example.com",
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["exists"] is False


@pytest.mark.asyncio
async def test_email_exists_case_insensitive(
    async_client: AsyncClient, test_user: User
):
    """Test that email exists check is case insensitive."""
    resp = await async_client.get(
        f"/api/v1/auth/exists?email={test_user.email.upper()}",
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["exists"] is True
