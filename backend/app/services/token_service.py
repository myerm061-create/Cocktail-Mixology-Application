from datetime import datetime, timedelta
from hashlib import sha256
from secrets import token_urlsafe
from typing import Literal, Optional, Tuple

from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session

from app.models.auth_token import AuthToken

Purpose = Literal["login", "reset"]


def _hash(raw: str) -> str:
    return sha256(raw.encode()).hexdigest()


def create_token(
    db: Session, email: str, purpose: Purpose, ttl_minutes: int
) -> Tuple[str, AuthToken]:
    """Create a short-lived, single-use token and persist its hash."""
    raw = token_urlsafe(32)
    rec = AuthToken(
        email=email,
        purpose=purpose,
        token_hash=_hash(raw),
        expires_at=datetime.utcnow() + timedelta(minutes=ttl_minutes),
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return raw, rec


def peek_token(db: Session, raw: str, purpose: Purpose) -> Optional[AuthToken]:
    """Look up a valid token **without** consuming it."""
    h = _hash(raw)
    stmt = select(AuthToken).where(
        and_(
            AuthToken.token_hash == h,
            AuthToken.purpose == purpose,
            AuthToken.consumed.is_(False),
            AuthToken.expires_at > datetime.utcnow(),
        )
    )
    return db.execute(stmt).scalar_one_or_none()


def consume_token(db: Session, raw: str, purpose: Purpose) -> Optional[AuthToken]:
    """Mark a valid token as consumed and return it; None if invalid/expired."""
    rec = peek_token(db, raw, purpose)
    if not rec:
        return None
    rec.consumed = True
    db.add(rec)
    db.commit()
    return rec


def count_recent(db: Session, email: str, purpose: Purpose, hours: int = 24) -> int:
    """Count tokens of this purpose for this email in the last N hours."""
    since = datetime.utcnow() - timedelta(hours=hours)
    stmt = (
        select(func.count())
        .select_from(AuthToken)
        .where(
            and_(
                AuthToken.email == email,
                AuthToken.purpose == purpose,
                AuthToken.created_at >= since,
            )
        )
    )
    return db.execute(stmt).scalar() or 0
