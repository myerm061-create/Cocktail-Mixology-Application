from pydantic import BaseModel, Field


class PantryIngredientRead(BaseModel):
    """Schema for reading a user's pantry ingredient."""

    id: int
    ingredient_id: int
    ingredient_name: str
    quantity: float = Field(ge=0.0, le=1.0, description="Quantity as fraction 0-1")

    class Config:
        from_attributes = True


class PantryAdd(BaseModel):
    """Schema for adding an ingredient to pantry."""

    ingredient_name: str = Field(..., min_length=1, max_length=128)
    quantity: float = Field(
        default=1.0, ge=0.0, le=1.0, description="Quantity as fraction 0-1"
    )


class PantryUpdate(BaseModel):
    """Schema for updating pantry ingredient quantity."""

    quantity: float = Field(..., ge=0.0, le=1.0, description="Quantity as fraction 0-1")

