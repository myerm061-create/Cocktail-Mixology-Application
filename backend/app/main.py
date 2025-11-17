# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers at top (fixes E402)
from app.api.v1 import api_v1
from app.core.db import Base, engine

# Import models BEFORE create_all so tables are registered
from app.models import auth_token as _m_auth_token  # noqa: F401
from app.models import user as _m_user  # noqa: F401

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

# Dev-only: create tables if missing
Base.metadata.create_all(bind=engine)

# Versioned API
app.include_router(api_v1, prefix="/api/v1")
