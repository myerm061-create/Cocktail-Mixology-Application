import uuid
from datetime import UTC, datetime, timedelta

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import get_db
from app.models.user import User


# ---- Password Hashing ----
def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


# ---- JWT Setup ----
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


class TokenError(Exception):
    """Custom error for invalid tokens."""

    pass


def _encode_token(data: dict, expires_delta: timedelta) -> str:
    """
    Internal helper to encode a JWT with an expiration and a unique ID (jti).
    Ensures each call produces a different token even for the same user.
    """
    to_encode = data.copy()
    expire = datetime.now(UTC) + expires_delta
    to_encode.update(
        {
            "exp": expire,
            "jti": uuid.uuid4().hex,  # per-token uniqueness
        }
    )
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_access_token(data: dict, expires_delta: timedelta) -> str:
    """Generate an access JWT."""
    return _encode_token(data, expires_delta)


def create_refresh_token(data: dict, expires_delta: timedelta) -> str:
    """Generate a refresh JWT."""
    return _encode_token(data, expires_delta)


def decode_refresh_token(token: str) -> dict:
    """Decode and validate a refresh token."""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        if payload.get("type") != "refresh":
            raise TokenError("Invalid token type")
        return payload
    except JWTError:
        raise TokenError("Invalid or expired refresh token")


# ---- User Authentication Dependency ----
def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    """Get the current logged-in user from a Bearer token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        if payload.get("type") != "access":
            raise credentials_exception
        user_id = int(payload.get("sub"))
    except (JWTError, ValueError):
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise credentials_exception

    return user
