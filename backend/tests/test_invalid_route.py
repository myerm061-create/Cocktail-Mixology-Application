import pytest
from httpx import AsyncClient
from app.main import app

# Test that invalid/non-existent routes return a 404 status code
@pytest.mark.asyncio
async def test_not_found_returns_404():
    async with AsyncClient(app=app, base_url="http://testserver") as ac:
        response = await ac.get("/nonexistent")
    assert response.status_code == 404
