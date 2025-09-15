# Cocktail API (Backend)

## Quick Start (Dev)

1) Install deps
   pip install -r requirements.txt

2) Run the server (hot reload)
   uvicorn app.main:app --reload --port 8000

3) Health check
   GET http://127.0.0.1:8000/api/v1/health  ->  { "status": "ok" }

## Environment
Copy `.env.example` to `.env` and fill in values when we add the DB.
