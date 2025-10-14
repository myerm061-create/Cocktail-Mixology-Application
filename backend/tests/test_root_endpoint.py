import pytest
from httpx import AsyncClient
from app.main import app


# Test that the root endpoint returns a successful response
@pytest.mark.asyncio
async def test_root_endpoint_returns_200():
    async with AsyncClient(app=app, base_url="http://testserver") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)
