import os

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import hash_password
from app.models.user import User
from app.services.mail_services import send_login_link, send_password_reset, send_verification_email
from app.services.password_policy import validate_password
from app.services.token_service import (
    consume_token,
    count_recent,
    create_token,
    peek_token,
)

router = APIRouter(prefix="/auth", tags=["auth"])

FRONTEND_URL = os.getenv("FRONTEND_URL", "https://mycabinet.me")
REDIRECT_URL = os.getenv("REDIRECT_URL", f"{FRONTEND_URL}/r")
ALLOWLIST = {
    e.strip().lower()
    for e in os.getenv("EMAIL_RATE_ALLOWLIST", "").split(",")
    if e.strip()
}


# --- Check if email is in allowlist for rate limiting bypass ---
def is_allowlisted(email: str) -> bool:
    return email.lower().strip() in ALLOWLIST


# --- Login via email link ---
class LoginRequest(BaseModel):
    email: EmailStr


@router.post("/login/request")
def request_login_link(
    payload: LoginRequest, bg: BackgroundTasks, db: Session = Depends(get_db)
):
    email = payload.email.lower().strip()
    under_limit = count_recent(db, email, "login") < 3
    # Rate limit; still return 200 to avoid enumeration.
    if under_limit or is_allowlisted(email):
        raw, _ = create_token(db, email, "login", ttl_minutes=10)
        login_url = f"{REDIRECT_URL}?type=login&token={raw}"
        bg.add_task(send_login_link, email, login_url)
    return {"ok": True}


class LoginFinish(BaseModel):
    token: str


@router.post("/login/finish")
def finish_login(payload: LoginFinish, db: Session = Depends(get_db)):
    rec = consume_token(db, payload.token, "login")
    if not rec:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    # TODO: mint and return a real access/refresh token pair for rec.email
    return {"ok": True, "email": rec.email, "session": "TODO_generate_token"}


# --- Password reset ---
class ResetRequest(BaseModel):
    email: EmailStr


@router.post("/reset/request")
def request_password_reset(
    payload: ResetRequest, bg: BackgroundTasks, db: Session = Depends(get_db)
):
    email = payload.email.lower().strip()
    user_exists = db.execute(
        select(User).where(User.email == email)
    ).scalar_one_or_none()
    # Only issue a reset token if the account exists.
    # Always return 200 to avoid user enumeration.
    if user_exists:
        under_limit = count_recent(db, email, "reset") < 3
        if under_limit or is_allowlisted(email):
            raw, _ = create_token(db, email, "reset", ttl_minutes=30)
            reset_url = f"{REDIRECT_URL}?type=reset&token={raw}"
            bg.add_task(send_password_reset, email, reset_url)

    return {"ok": True}

class ResetConfirm(BaseModel):
    token: str
    # New password to set
    new_password: str = Field(min_length=1, max_length=256)


@router.post("/reset/confirm")
def confirm_password_reset(payload: ResetConfirm, db: Session = Depends(get_db)):
    # 1) Validate token WITHOUT consuming it
    rec = peek_token(db, payload.token, "reset")
    if not rec:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    # 2) Enforce password policy
    errs = validate_password(payload.new_password, email=rec.email)
    if errs:
        # 422 Unprocessable Entity for policy violations
        raise HTTPException(status_code=422, detail={"password_policy": errs})

    # 3) Lookup user and set bcrypt hash
    user = db.execute(select(User).where(User.email == rec.email)).scalar_one_or_none()
    if not user:
        # Rare Execption: token exists for an email that isn't a user any more
        raise HTTPException(status_code=400, detail="Account not found")

    user.password_hash = hash_password(payload.new_password)
    db.add(user)
    db.commit()

    # 4) Now consume the token (single-use)
    consume_token(db, payload.token, "reset")

    return {"ok": True}

class VerifyRequest(BaseModel):
    email: EmailStr

@router.post("/verify/request")
def request_verification_link(
    payload: VerifyRequest, bg: BackgroundTasks, db: Session = Depends(get_db)
):
    email = payload.email.lower().strip()

    # Only send if account exists; always return 200 to avoid enumeration
    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if user:
        # Optional: skip if already verified (only if your model has such a field)
        already_verified = getattr(user, "is_verified", False)
        if not already_verified:
            under_limit = count_recent(db, email, "verify") < 3
            if under_limit or is_allowlisted(email):
                raw, _ = create_token(db, email, "verify", ttl_minutes=60)
                verify_url = f"{REDIRECT_URL}?type=verify&token={raw}"
                bg.add_task(send_verification_email, email, verify_url)

    return {"ok": True}


class VerifyConfirm(BaseModel):
    token: str

@router.post("/verify/confirm")
def confirm_verification(payload: VerifyConfirm, db: Session = Depends(get_db)):
    rec = consume_token(db, payload.token, "verify")
    if not rec:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user = db.execute(select(User).where(User.email == rec.email)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=400, detail="Account not found")

    if hasattr(user, "is_verified"):
        setattr(user, "is_verified", True)
        db.add(user)
        db.commit()

    return {"ok": True, "email": rec.email}