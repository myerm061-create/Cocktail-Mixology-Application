from sqlalchemy import Float, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


class UserIngredient(Base):
    """Link table for user's pantry ingredients (many-to-many relationship)."""

    __tablename__ = "user_ingredients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    ingredient_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("ingredients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # Quantity as fraction 0-1 (1.0 = full bottle, 0.5 = half, etc.)
    quantity: Mapped[float] = mapped_column(
        Float, default=1.0, nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="pantry_ingredients")
    ingredient: Mapped["Ingredient"] = relationship(
        "Ingredient", back_populates="users"
    )

    __table_args__ = (
        UniqueConstraint("user_id", "ingredient_id", name="uq_user_ingredient"),
    )

