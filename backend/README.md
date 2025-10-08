## Quick Start

1) **Set up environment**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials
   ```

2) **Install and run**
   ```bash
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   # source venv/bin/activate  # Mac/Linux
   
   pip install -r requirements.txt
   python -m alembic upgrade head
   uvicorn app.main:app --reload --port 8000
   ```

3) **Test**
   Open http://127.0.0.1:8000/api/v1/health
   Should return: `{"status": "ok"}`

## Database Migrations

```bash
python -m alembic revision --autogenerate -m "description"
python -m alembic upgrade head
```

## Environment Variables

See `.env.example` for all required configuration variables.