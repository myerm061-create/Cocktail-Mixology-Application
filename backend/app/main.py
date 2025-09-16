from fastapi import FastAPI
from app.api.v1.routes_health import router as health_router

app = FastAPI(title="Cocktail API")

# Versioned API
app.include_router(health_router, prefix="/api/v1")
