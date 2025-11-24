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
    existing = (
        db_session.query(User).filter(User.email == "test_rec@example.com").first()
    )
    if existing:
        db_session.delete(existing)
        db_session.commit()

    user = User(
        email="test_rec@example.com",
        hashed_password=hash_password("testpass123"),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    yield user

    db_session.delete(user)
    db_session.commit()


@pytest_asyncio.fixture
async def authenticated_client(test_user: User) -> AsyncClient:
    """Create an authenticated async client with test user's token."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"email": test_user.email, "password": "testpass123"},
        )
        assert login_resp.status_code == 200
        tokens = login_resp.json()
        access_token = tokens["access_token"]
        client.headers.update({"Authorization": f"Bearer {access_token}"})
        yield client


@pytest.mark.asyncio
async def test_recommendations_without_pantry(authenticated_client: AsyncClient):
    """Test recommendations endpoint with empty pantry."""
    resp = await authenticated_client.get("/api/v1/recommendations")
    assert resp.status_code == 200
    data = resp.json()
    assert "cocktails" in data
    assert "fully_makeable_count" in data
    assert "total_found" in data
    assert data["cocktails"] == []
    assert data["fully_makeable_count"] == 0
    assert data["total_found"] == 0


@pytest.mark.asyncio
async def test_recommendations_with_pantry(authenticated_client: AsyncClient):
    """Test recommendations endpoint with pantry ingredients."""
    # Add some ingredients
    ingredients = ["Gin", "Vodka", "Lime Juice"]
    for ingredient in ingredients:
        resp = await authenticated_client.post(
            "/api/v1/users/me/pantry",
            json={"ingredient_name": ingredient, "quantity": 1.0},
        )
        assert resp.status_code == 201

    # Get recommendations
    resp = await authenticated_client.get("/api/v1/recommendations?limit=10")
    assert resp.status_code == 200
    data = resp.json()

    # Verify response structure
    assert "cocktails" in data
    assert "fully_makeable_count" in data
    assert "total_found" in data
    assert isinstance(data["cocktails"], list)
    assert isinstance(data["fully_makeable_count"], int)
    assert isinstance(data["total_found"], int)

    # If cocktails are returned, verify structure
    if len(data["cocktails"]) > 0:
        cocktail = data["cocktails"][0]
        assert "id" in cocktail
        assert "name" in cocktail
        assert "fully_makeable" in cocktail
        assert "match_score" in cocktail
        assert "missing_ingredients" in cocktail
        assert "ingredients" in cocktail
        assert isinstance(cocktail["fully_makeable"], bool)
        assert isinstance(cocktail["match_score"], dict)
        assert "matched" in cocktail["match_score"]
        assert "total" in cocktail["match_score"]
        assert "percentage" in cocktail["match_score"]


@pytest.mark.asyncio
async def test_recommendations_limit_parameter(authenticated_client: AsyncClient):
    """Test recommendations endpoint with different limit values."""
    # Add ingredients
    await authenticated_client.post(
        "/api/v1/users/me/pantry",
        json={"ingredient_name": "Gin", "quantity": 1.0},
    )

    # Test with limit=5
    resp = await authenticated_client.get("/api/v1/recommendations?limit=5")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["cocktails"]) <= 5

    # Test with limit=1
    resp = await authenticated_client.get("/api/v1/recommendations?limit=1")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["cocktails"]) <= 1


@pytest.mark.asyncio
async def test_recommendations_fully_makeable_only(authenticated_client: AsyncClient):
    """Test recommendations endpoint with fully_makeable_only parameter."""
    # Add ingredients
    await authenticated_client.post(
        "/api/v1/users/me/pantry",
        json={"ingredient_name": "Gin", "quantity": 1.0},
    )

    # Test with fully_makeable_only=True
    resp = await authenticated_client.get(
        "/api/v1/recommendations?fully_makeable_only=true&limit=10"
    )
    assert resp.status_code == 200
    data = resp.json()

    # If cocktails are returned, all should be fully makeable
    for cocktail in data["cocktails"]:
        assert cocktail["fully_makeable"] is True
        assert len(cocktail["missing_ingredients"]) == 0


@pytest.mark.asyncio
async def test_recommendations_requires_authentication():
    """Test that recommendations endpoint requires authentication."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/v1/recommendations")
        assert resp.status_code == 401  # Unauthorized
