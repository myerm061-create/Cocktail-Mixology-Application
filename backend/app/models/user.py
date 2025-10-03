from sqlalchemy.orm import declarative_base, Mapped, mapped_column
from sqlalchemy import String, Integer

Base = declarative_base()

# User model to represent users in the database
class User(Base):
    __tablename__ = "users"

    # Database fields
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255))
    provider: Mapped[str] = mapped_column(String(32), default="local", nullable=False)    
    provider_id: Mapped[str | None] = mapped_column(String(128), index=True)              
    # password_hash: Mapped[str | None] = mapped_column(String(255)) # Uncomment if using local auth
