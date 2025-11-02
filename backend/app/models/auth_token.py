from app.core.db import Base
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, DateTime, Boolean
from datetime import datetime, timedelta

# --- AuthToken model ---
class AuthToken(Base):
    __tablename__ = "auth_tokens"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(320), index=True)
    purpose: Mapped[str] = mapped_column(String(16))
    token_hash: Mapped[str] = mapped_column(String(64), index=True, unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    consumed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    @staticmethod
    def default_expiry(minutes: int) -> datetime:
        return datetime.utcnow() + timedelta(minutes=minutes)
