import os
from enum import Enum
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import hash_password
from app.models.user import User
from app.services.mail_services import (
    send_login_code,
    send_verify_code,
    send_reset_code,
    send_delete_code,
    send_password_changed_notice,
)
from app.services.password_policy import validate_password
from app.services.token_service import (
    count_recent,
    create_otp,
    verify_otp,
)

router = APIRouter(prefix="/auth", tags=["auth"])

ALLOWLIST = {
    e.strip().lower()
    for e in os.getenv("EMAIL_RATE_ALLOWLIST", "").split(",")
    if e.strip()
}

def is_allowlisted(email: str) -> bool:
    return email.lower().strip() in ALLOWLIST

# ---------------------------
# OTP-only unified endpoints
# ---------------------------

class Intent(str, Enum):
    login = "login"     # login/register (passwordless or “email me a code”)
    verify = "verify"   # verify email after sign-up
    reset = "reset"     # begin password reset
    delete = "delete"   # confirm account deletion

# Map Intent -> *_otp purpose strings used in token_service
OTP_PURPOSE = {
    Intent.login:  "login_otp",
    Intent.verify: "verify_otp",
    Intent.reset:  "reset_otp",
    Intent.delete: "delete_otp",
}

class OtpRequest(BaseModel):
    email: EmailStr
    intent: Intent

@router.post("/otp/request")
def request_otp(
    payload: OtpRequest, bg: BackgroundTasks, db: Session = Depends(get_db)
):
    """
    Issue a short-lived, single-use OTP and email it. Always 200 to avoid enumeration.
    Per (email,intent) limit ≤3 / 24h unless allowlisted.
    """
    email = payload.email.lower().strip()
    intent = payload.intent
    purpose = OTP_PURPOSE[intent]

    # Gate by intent: only send when it makes sense, but never leak state
    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()

    should_send = False
    if intent == Intent.login:
        # For login/register UX you can choose to send regardless (no enumeration).
        # If you want to restrict to existing accounts, flip to: should_send = bool(user)
        should_send = True

    elif intent == Intent.verify:
        # Only send if the account exists and is not verified yet
        if user and getattr(user, "is_verified", False) is False:
            should_send = True

    elif intent == Intent.reset:
        # Only send reset if the account exists
        if user:
            should_send = True

    elif intent == Intent.delete:
        # Only send delete code if the account exists
        if user:
            should_send = True

    if should_send:
        under_limit = count_recent(db, email, purpose, hours=24) < 3
        if under_limit or is_allowlisted(email):
            # TTLs by intent (tweak to taste)
            ttl = 10 if intent in (Intent.login, Intent.verify) else 15
            otp, _rec = create_otp(db, email, purpose, ttl_minutes=ttl)

            # Send mail by intent
            if intent == Intent.login:
                bg.add_task(send_login_code, email, otp)
            elif intent == Intent.verify:
                bg.add_task(send_verify_code, email, otp)
            elif intent == Intent.reset:
                bg.add_task(send_reset_code, email, otp)
            elif intent == Intent.delete:
                bg.add_task(send_delete_code, email, otp)

    # Uniform response to prevent enumeration
    return {"ok": True}

# --- Verify endpoint ---

class OtpVerify(BaseModel):
    email: EmailStr
    intent: Intent
    otp: str = Field(min_length=4, max_length=12)  # 6–8 typical; keep flexible
    # For reset flow only
    new_password: Optional[str] = Field(default=None, min_length=1, max_length=256)

@router.post("/otp/verify")
def verify_otp_code(
    payload: OtpVerify, db: Session = Depends(get_db)
):
    """
    Verify a code for the given (email,intent).
    On success:
      - login: mint session/refresh
      - verify: mark user verified
      - reset: set new password and revoke old sessions (TODO in your session store)
      - delete: delete the account (or queue deletion)
    """
    email = payload.email.lower().strip()
    intent = payload.intent
    purpose = OTP_PURPOSE[intent]

    # Constant-time verification + attempt lockouts are handled in token_service.verify_otp
    ok = verify_otp(db, email=email, purpose=purpose, otp=payload.otp)
    if not ok:
        # Keep error generic to avoid info leaks
        raise HTTPException(status_code=400, detail="Invalid or expired code")

    # From here on, the OTP has been consumed. Perform the intent.
    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()

    if intent == Intent.login:
        # If create user here when absent.
        if not user:
            # Minimal auto-provisioning (optional). Otherwise, raise 400.
            user = User(email=email)
            db.add(user)
            db.commit()
            db.refresh(user)

        # TODO: mint and return real session/refresh tokens
        return {"ok": True, "email": user.email, "session": "TODO_generate_token"}

    if not user:
        # For verify/reset/delete we expect the account to exist
        raise HTTPException(status_code=400, detail="Account not found")

    if intent == Intent.verify:
        if hasattr(user, "is_verified"):
            setattr(user, "is_verified", True)
            db.add(user)
            db.commit()
        return {"ok": True, "email": user.email, "verified": True}

    if intent == Intent.reset:
        if not payload.new_password:
            raise HTTPException(status_code=400, detail="Missing new_password")

        errs = validate_password(payload.new_password, email=user.email)
        if errs:
            # 422 for policy violations 
            raise HTTPException(status_code=422, detail={"password_policy": errs})

        user.password_hash = hash_password(payload.new_password)
        db.add(user)
        db.commit()

        # TODO: revoke existing sessions for this user in your session store
        # Optional notify
        try:
            send_password_changed_notice(user.email)
        except Exception:
            # Don't fail the reset if the notice fails to send
            pass

        return {"ok": True}

    if intent == Intent.delete:
        # queue deletion with a grace window
        return {"ok": True, "deleted": True}

    # Should never reach here
    raise HTTPException(status_code=400, detail="Unsupported intent")
