from datetime import datetime, timedelta
from hashlib import sha256
from secrets import token_urlsafe
from typing import Literal, Tuple, Optional

from sqlalchemy import select, func, and_
from sqlalchemy.orm import Session

from app.models.auth_token import AuthToken

# Token purpose type
Purpose = Literal["login", "reset"]

# --- Hash a raw token string ---
def _hash(raw: str) -> str:
    return sha256(raw.encode()).hexdigest()

# --- Create a new token ---
def create_token(db: Session, email: str, purpose: Purpose, ttl_minutes: int) -> Tuple[str, AuthToken]:
    raw = token_urlsafe(32)
    rec = AuthToken(
        email=email,
        purpose=purpose,
        token_hash=_hash(raw),
        expires_at=AuthToken.default_expiry(ttl_minutes),
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return raw, rec

# --- Consume (validate and mark as used) a token ---
def consume_token(db: Session, raw: str, purpose: Purpose) -> AuthToken | None:
    h = _hash(raw)
    rec = db.execute(
        select(AuthToken).where(
            and_(
                AuthToken.token_hash == h,
                AuthToken.purpose == purpose,
                AuthToken.consumed == False,
                AuthToken.expires_at > datetime.utcnow(),
            )
        )
    ).scalar_one_or_none()
    if not rec:
        return None
    rec.consumed = True
    db.add(rec)
    db.commit()
    return rec

# --- Count recent tokens for rate limiting ---
def count_recent(db: Session, email: str, purpose: Purpose, hours: int = 24) -> int:
    since = datetime.utcnow() - timedelta(hours=hours)
    return db.execute(
        select(func.count()).select_from(AuthToken).where(
            and_(AuthToken.email == email, AuthToken.purpose == purpose, AuthToken.created_at >= since)
        )
    ).scalar() or 0

# --- Peek at a token without consuming it ---
def peek_token(db: Session, raw: str, purpose: Purpose) -> Optional[AuthToken]:
    h = _hash(raw)
    return db.execute(
        select(AuthToken).where(
            and_(
                AuthToken.token_hash == h,
                AuthToken.purpose == purpose,
                AuthToken.consumed == False,
                AuthToken.expires_at > datetime.utcnow(),
            )
        )
    ).scalar_one_or_none()