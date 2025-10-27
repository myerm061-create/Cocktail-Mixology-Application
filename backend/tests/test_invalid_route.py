import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

# Test that invalid/non-existent routes return a 404 status code
@pytest.mark.asyncio
async def test_not_found_returns_404():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        res = await ac.get("/nope")
        assert res.status_code == 404
