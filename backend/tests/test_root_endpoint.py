import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

# Test that the root endpoint returns a successful response
@pytest.mark.asyncio
async def test_root_endpoint_returns_200():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        res = await ac.get("/api/v1/health")
        assert res.status_code == 200
