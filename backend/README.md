# Cocktail API (Backend)

## Quick Start (Dev)

**Environment Variables**
- Copy `.env.example` → `.env`
- Fill in `DATABASE_URL` with the team’s shared Postgres connection string
- The actual connection string will be shared privately (not in GitHub)

1) **Set up a virtual environment** (recommended)
   ```bash
   # Windows PowerShell
   cd backend
   python -m venv venv
   .\venv\Scripts\activate

   # Mac/Linux
   cd backend
   python3 -m venv venv
   source venv/bin/activate

2) Install dependencies
pip install -r requirements.txt

3) Run the server
uvicorn app.main:app --reload --port 8000

4) Test health check
Open http://127.0.0.1:8000/api/v1/health
return: status : ok