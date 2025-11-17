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
    existing = db_session.query(User).filter(User.email == "test_e2e@example.com").first()
    if existing:
        db_session.delete(existing)
        db_session.commit()
    
    user = User(
        email="test_e2e@example.com",
        hashed_password=hash_password("testpass123"),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    yield user
    
    # Cleanup after test
    db_session.delete(user)
    db_session.commit()


@pytest_asyncio.fixture
async def authenticated_client(test_user: User) -> AsyncClient:
    """Create an authenticated async client with test user's token."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Login to get access token
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"email": test_user.email, "password": "testpass123"},
        )
        assert login_resp.status_code == 200
        tokens = login_resp.json()
        access_token = tokens["access_token"]

        # Set authorization header
        client.headers.update({"Authorization": f"Bearer {access_token}"})
        yield client


@pytest.mark.asyncio
async def test_pantry_to_recommendations_flow(authenticated_client: AsyncClient, db_session: Session, test_user: User):
    """
    E2E test: Add pantry ingredients → Get recommendations → Assert fully makeable drinks.
    
    This test simulates the complete user flow:
    1. User has pantry ingredients
    2. User requests recommendations
    3. At least one cocktail should be fully makeable from pantry
    """
    # Step 1: Add pantry ingredients (very common ingredients that appear in many cocktails)
    # Using ingredients that are in many popular cocktails to increase chances of matches
    ingredients_to_add = [
        {"ingredient_name": "Gin", "quantity": 1.0},
        {"ingredient_name": "Vodka", "quantity": 1.0},
        {"ingredient_name": "Lime Juice", "quantity": 1.0},
        {"ingredient_name": "Lemon Juice", "quantity": 1.0},
        {"ingredient_name": "Simple Syrup", "quantity": 1.0},
        {"ingredient_name": "Triple Sec", "quantity": 1.0},
        {"ingredient_name": "Orange Juice", "quantity": 1.0},
    ]

    for ingredient in ingredients_to_add:
        resp = await authenticated_client.post(
            "/api/v1/users/me/pantry",
            json=ingredient,
        )
        assert resp.status_code == 201, f"Failed to add {ingredient['ingredient_name']}: {resp.text}"

    # Step 2: Verify pantry was updated
    pantry_resp = await authenticated_client.get("/api/v1/users/me/pantry")
    assert pantry_resp.status_code == 200
    pantry = pantry_resp.json()
    assert len(pantry) >= 7, f"Expected at least 7 ingredients, got {len(pantry)}"

    # Step 3: Get recommendations (request more to increase chances of matches)
    # Try multiple times to increase likelihood of finding fully makeable cocktails
    rec_resp = await authenticated_client.get("/api/v1/recommendations?limit=50")
    assert rec_resp.status_code == 200, f"Recommendations failed: {rec_resp.text}"
    
    recommendations = rec_resp.json()
    assert "cocktails" in recommendations
    assert "fully_makeable_count" in recommendations
    assert "total_found" in recommendations
    
    cocktails = recommendations["cocktails"]
    fully_makeable_count = recommendations["fully_makeable_count"]
    
    # Step 4: Verify response structure
    assert isinstance(cocktails, list)
    assert isinstance(fully_makeable_count, int)
    assert fully_makeable_count >= 0
    
    # Step 5: Assert at least one drink is "fully makeable"
    # With common ingredients like Gin, Vodka, Lime Juice, we should find matches
    
    # First verify the endpoint returned cocktails
    # Note: TheCocktailDB API may be unavailable or slow, so we make this informative
    if len(cocktails) == 0:
        # If no cocktails, the endpoint still worked correctly (returned 200 with empty list)
        # This is acceptable for a test that depends on external API
        pytest.skip(
            "No cocktails returned from TheCocktailDB API. "
            "This may indicate network issues or API unavailability. "
            "Skipping assertion for fully makeable cocktails."
        )
    
    # Verify cocktail structure
    for cocktail in cocktails:
        assert "id" in cocktail
        assert "name" in cocktail
        assert "fully_makeable" in cocktail
        assert "match_score" in cocktail
        assert "missing_ingredients" in cocktail
        assert isinstance(cocktail["fully_makeable"], bool)
        assert isinstance(cocktail["match_score"], dict)
        assert "percentage" in cocktail["match_score"]
    
    # Verify that fully_makeable_count matches actual fully makeable cocktails
    actual_fully_makeable = sum(1 for c in cocktails if c["fully_makeable"])
    assert actual_fully_makeable == fully_makeable_count, (
        f"fully_makeable_count ({fully_makeable_count}) doesn't match "
        f"actual count ({actual_fully_makeable})"
    )
    
    # Assert at least one fully makeable cocktail
    # With common ingredients (Gin, Vodka, Lime, Lemon, Simple Syrup, Triple Sec, Orange Juice)
    # we should find at least one match from random cocktails
    # If we don't find any, it may be due to:
    # - Random cocktails not matching our pantry
    # - Ingredient name normalization issues
    # - TheCocktailDB API returning cocktails with different ingredient names
    assert fully_makeable_count > 0, (
        f"Expected at least one fully makeable cocktail, but found {fully_makeable_count}. "
        f"Total cocktails: {len(cocktails)}. "
        f"Pantry ingredients: {[ing['ingredient_name'] for ing in ingredients_to_add]}. "
        f"This may indicate an issue with ingredient matching logic or TheCocktailDB API responses. "
        f"Sample cocktail ingredients: {cocktails[0]['ingredients'] if cocktails else 'N/A'}"
    )

