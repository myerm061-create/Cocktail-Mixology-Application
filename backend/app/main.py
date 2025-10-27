from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.routes_auth import router as auth_router
from app.api.v1.routes_health import router as health_router
from app.core.db import Base, engine

# Dev-only: create tables if missing (use Alembic later)
Base.metadata.create_all(bind=engine)

# Application instance
app = FastAPI(title="Cocktail API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://localhost:19006",
        "http://localhost:5173",
        "http://127.0.0.1:8081",
        "http://127.0.0.1:19006",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Versioned API
app.include_router(auth_router, prefix="/api/v1")
app.include_router(health_router, prefix="/api/v1")
