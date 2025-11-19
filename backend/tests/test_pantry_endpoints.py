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
        db_session.query(User).filter(User.email == "test_pantry@example.com").first()
    )
    if existing:
        db_session.delete(existing)
        db_session.commit()

    user = User(
        email="test_pantry@example.com",
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
async def test_add_ingredient_to_pantry(authenticated_client: AsyncClient):
    """Test adding a single ingredient to pantry."""
    resp = await authenticated_client.post(
        "/api/v1/users/me/pantry",
        json={"ingredient_name": "Gin", "quantity": 1.0},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert "id" in data
    assert data["ingredient_name"] == "Gin"
    assert data["quantity"] == 1.0


@pytest.mark.asyncio
async def test_get_empty_pantry(authenticated_client: AsyncClient):
    """Test getting empty pantry."""
    resp = await authenticated_client.get("/api/v1/users/me/pantry")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_add_multiple_ingredients(authenticated_client: AsyncClient):
    """Test adding multiple ingredients to pantry."""
    ingredients = ["Gin", "Vodka", "Lime Juice"]
    for ingredient in ingredients:
        resp = await authenticated_client.post(
            "/api/v1/users/me/pantry",
            json={"ingredient_name": ingredient, "quantity": 1.0},
        )
        assert resp.status_code == 201

    # Verify all were added
    resp = await authenticated_client.get("/api/v1/users/me/pantry")
    assert resp.status_code == 200
    pantry = resp.json()
    assert len(pantry) == 3
    pantry_names = {item["ingredient_name"] for item in pantry}
    assert pantry_names == set(ingredients)


@pytest.mark.asyncio
async def test_update_ingredient_quantity(authenticated_client: AsyncClient):
    """Test updating ingredient quantity."""
    # Add ingredient
    resp = await authenticated_client.post(
        "/api/v1/users/me/pantry",
        json={"ingredient_name": "Gin", "quantity": 1.0},
    )
    assert resp.status_code == 201
    data = resp.json()
    ingredient_id = data["id"]

    # Update quantity
    resp = await authenticated_client.put(
        f"/api/v1/users/me/pantry/{ingredient_id}",
        json={"quantity": 0.5},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["quantity"] == 0.5


@pytest.mark.asyncio
async def test_remove_ingredient_from_pantry(authenticated_client: AsyncClient):
    """Test removing an ingredient from pantry."""
    # Add ingredient
    resp = await authenticated_client.post(
        "/api/v1/users/me/pantry",
        json={"ingredient_name": "Gin", "quantity": 1.0},
    )
    assert resp.status_code == 201
    data = resp.json()
    ingredient_id = data["id"]

    # Remove ingredient
    resp = await authenticated_client.delete(f"/api/v1/users/me/pantry/{ingredient_id}")
    assert resp.status_code == 204

    # Verify it's gone
    resp = await authenticated_client.get("/api/v1/users/me/pantry")
    assert resp.status_code == 200
    pantry = resp.json()
    assert len(pantry) == 0


@pytest.mark.asyncio
async def test_add_duplicate_ingredient_updates_quantity(
    authenticated_client: AsyncClient,
):
    """Test that adding duplicate ingredient updates quantity instead of creating new entry."""
    # Add ingredient
    resp = await authenticated_client.post(
        "/api/v1/users/me/pantry",
        json={"ingredient_name": "Gin", "quantity": 1.0},
    )
    assert resp.status_code == 201

    # Add same ingredient with different quantity
    resp = await authenticated_client.post(
        "/api/v1/users/me/pantry",
        json={"ingredient_name": "Gin", "quantity": 0.5},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["quantity"] == 0.5

    # Verify only one entry exists
    resp = await authenticated_client.get("/api/v1/users/me/pantry")
    assert resp.status_code == 200
    pantry = resp.json()
    assert len(pantry) == 1
