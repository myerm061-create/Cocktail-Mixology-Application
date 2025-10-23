from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserRead, TokenPair

router = APIRouter(prefix="/auth", tags=["auth"])

DbDep = Annotated[Session, Depends(get_db)]

# ---- Helpers -----
def _issue_tokens(*, user_id: int) -> TokenPair:
    access_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    access_token = security.create_access_token(
        data={"sub": str(user_id), "type": "access"},
        expires_delta=access_expires,
    )
    refresh_token = security.create_refresh_token(
        data={"sub": str(user_id), "type": "refresh"},
        expires_delta=refresh_expires,
    )
    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=int(access_expires.total_seconds()),
    )


def _find_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


# ----- Routes ----
@router.post("/register", response_model=TokenPair, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: DbDep):
    existing = _find_user_by_email(db, payload.email.lower())
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    hashed = security.get_password_hash(payload.password)
    user = User(email=payload.email.lower(), hashed_password=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)

    return _issue_tokens(user_id=user.id)


@router.post("/login", response_model=TokenPair)
def login(payload: UserLogin, db: DbDep):
    user = _find_user_by_email(db, payload.email.lower())
    if not user or not security.verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return _issue_tokens(user_id=user.id)


@router.post("/refresh", response_model=TokenPair)
def refresh(token_pair: TokenPair):
    try:
        claims = security.decode_refresh_token(token_pair.refresh_token)
    except security.TokenError as e:
        raise HTTPException(status_code=401, detail=str(e))

    user_id = int(claims.get("sub"))
    return _issue_tokens(user_id=user_id)


@router.post("/logout", status_code=204)
def logout(_: DbDep, response: Response):
    response.status_code = status.HTTP_204_NO_CONTENT
    return


@router.get("/me", response_model=UserRead)
def me(current_user: Annotated[User, Depends(security.get_current_user)]):
    return UserRead(id=current_user.id, email=current_user.email)
