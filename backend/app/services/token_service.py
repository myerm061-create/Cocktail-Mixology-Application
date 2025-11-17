from datetime import datetime, timedelta
from hashlib import sha256
from hmac import compare_digest
from logging import getLogger
from secrets import randbelow, token_urlsafe
from typing import Literal, Optional, Tuple

from sqlalchemy import and_, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.auth_token import AuthToken

log = getLogger(__name__)

# ----- Configs -----
# OTP: 6 digits, 10-minute TTL, 5 tries, 3 sends per 24h
OTP_LENGTH = 6
OTP_TTL_MINUTES_DEFAULT = 10
OTP_MAX_ATTEMPTS = 5

Purpose = Literal[
    "login",  # existing magic-link/session tokens
    "reset",
    "login_otp",
    "verify_otp",
    "reset_otp",
    "delete_otp",
]


def _hash(raw: str) -> str:
    return sha256(raw.encode("utf-8")).hexdigest()


def _hash_otp(email: str, purpose: str, otp: str) -> str:
    key = f"{email.strip().lower()}|{purpose}|{otp.strip()}"
    return sha256(key.encode("utf-8")).hexdigest()


def _now() -> datetime:
    return datetime.utcnow()


def _normalize_email(email: str) -> str:
    return email.strip().lower()


# ===== Generic token helpers  =====


def create_token(
    db: Session, email: str, purpose: Purpose, ttl_minutes: int
) -> Tuple[str, AuthToken]:
    """
    Create a short-lived, single-use opaque token and persist its hash.
    """
    raw = token_urlsafe(32)  # ~256 bits pre-Base64; plenty of entropy
    rec = AuthToken(
        email=_normalize_email(email),
        purpose=purpose,
        token_hash=_hash(raw),
        expires_at=_now() + timedelta(minutes=ttl_minutes),
        attempts=0,  # safe default even if not used for opaque tokens
        consumed=False,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return raw, rec


def peek_token(db: Session, raw: str, purpose: Purpose) -> Optional[AuthToken]:
    """
    Look up a valid token **without** consuming it.
    """
    h = _hash(raw)
    stmt = select(AuthToken).where(
        and_(
            AuthToken.token_hash == h,
            AuthToken.purpose == purpose,
            AuthToken.consumed.is_(False),
            AuthToken.expires_at > _now(),
        )
    )
    return db.execute(stmt).scalar_one_or_none()


def consume_token(db: Session, raw: str, purpose: Purpose) -> Optional[AuthToken]:
    """
    Mark a valid token as consumed and return it; None if invalid/expired.
    """
    rec = peek_token(db, raw, purpose)
    if not rec:
        return None
    rec.consumed = True
    db.add(rec)
    db.commit()
    return rec


def count_recent(db: Session, email: str, purpose: Purpose, hours: int = 24) -> int:
    """
    Count tokens of this purpose for this email in the last N hours.
    Used for rate-limiting / abuse prevention.
    """
    since = _now() - timedelta(hours=hours)
    stmt = (
        select(func.count())
        .select_from(AuthToken)
        .where(
            and_(
                AuthToken.email == _normalize_email(email),
                AuthToken.purpose == purpose,
                AuthToken.created_at >= since,
            )
        )
    )
    return int(db.execute(stmt).scalar() or 0)


# ===== OTP helpers (primary new flow) =====


def _gen_otp(length: int = OTP_LENGTH) -> str:
    """
    Generate a zero-padded numeric OTP using a CSPRNG.
    """
    upper = 10**length
    return str(randbelow(upper)).zfill(length)


def create_otp(db, email, purpose, ttl_minutes=10):
    if not str(purpose).endswith("_otp"):
        raise ValueError("create_otp requires an *_otp purpose")
    otp = _gen_otp(6)  # fixed 6-digit OTPs for now
    norm = _normalize_email(email)
    rec = AuthToken(
        email=norm,
        purpose=purpose,
        token_hash=_hash_otp(norm, purpose, otp),
        expires_at=_now() + timedelta(minutes=ttl_minutes),
        attempts=0,
        consumed=False,
    )
    try:
        db.add(rec)
        db.commit()
        db.refresh(rec)
    except IntegrityError:
        db.rollback()
        otp = _gen_otp(6)
        rec.token_hash = _hash_otp(norm, purpose, otp)
        db.add(rec)
        db.commit()
        db.refresh(rec)
    return otp, rec


def verify_otp(db, email, purpose, otp, max_attempts=5) -> bool:
    # fetch newest unconsumed, unexpired code for (email, purpose)
    norm = _normalize_email(email)
    rec = db.execute(
        select(AuthToken)
        .where(
            AuthToken.email == norm,
            AuthToken.purpose == purpose,
            AuthToken.consumed.is_(False),
            AuthToken.expires_at > _now(),
        )
        .order_by(AuthToken.created_at.desc())
        .limit(1)
    ).scalar_one_or_none()
    if not rec:
        return False

    locked = rec.attempts >= max_attempts
    provided = _hash_otp(norm, purpose, otp)
    ok = compare_digest(provided, rec.token_hash)

    if ok and not locked:
        rec.consumed = True
        rec.attempts += 1
        db.add(rec)
        db.commit()
        return True

    # increment attempts on failure
    rec.attempts = min(rec.attempts + 1, max_attempts)
    db.add(rec)
    db.commit()
    return False
