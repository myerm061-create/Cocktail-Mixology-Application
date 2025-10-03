from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.config import settings
from app.core import security
from app.models.user import User
from app.schemas.user import UserOut
from app.services import auth_google

router = APIRouter(prefix="/auth/google", tags=["auth_google"])

# Endpoint to initiate Google OAuth2 login
@router.get("/login")
def login_via_google():
    url = auth_google.build_auth_url(
        client_id=settings.GOOGLE_CLIENT_ID,
        redirect_uri=settings.GOOGLE_REDIRECT_URI,
        scope=["openid", "email", "profile"],
        # optional:
        prompt="consent",          
        access_type="offline",     
    )
    return {"auth_url": url}

# Callback endpoint to handle Google's response
@router.get("/callback")
def google_callback(
    code: str,
    code_verifier: str | None = None,  
    db: Session = Depends(get_db),
):
    tokens = auth_google.exchange_code_for_token(
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        code=code,
        redirect_uri=settings.GOOGLE_REDIRECT_URI,
        code_verifier=code_verifier,
    )
    id_token = tokens.get("id_token")
    if not id_token:
        raise HTTPException(status_code=400, detail="Missing id_token from Google")

    claims = auth_google.verify_google_id_token(id_token, audience=settings.GOOGLE_CLIENT_ID)

    email = claims.get("email")
    sub = claims.get("sub")
    if not email or not sub:
        raise HTTPException(status_code=400, detail="Google token missing required claims")

    # Check if user exists, if not create a new user
    user = db.query(User).filter(User.provider == "google", User.provider_id == sub).first()
    if not user:
        user = User(
            email=email,
            full_name=claims.get("name"),
            provider="google",
            provider_id=sub,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Create a JWT token for the user
    access_token = security.create_access_token({"sub": str(user.id)})
    return {"user": UserOut.model_validate(user), "access_token": access_token, "token_type": "bearer"}
