from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.ingredient import Ingredient
from app.models.link_tables import UserIngredient
from app.models.user import User
from app.schemas.ingredient import PantryAdd, PantryIngredientRead, PantryUpdate

router = APIRouter(prefix="/users/me/pantry", tags=["pantry"])

DbDep = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


def _to_pantry_read(item: UserIngredient) -> PantryIngredientRead:
    """Helper to convert UserIngredient to PantryIngredientRead."""
    return PantryIngredientRead(
        id=item.id,
        ingredient_id=item.ingredient_id,
        ingredient_name=item.ingredient.name,
        quantity=item.quantity,
    )


@router.get("", response_model=list[PantryIngredientRead])
def get_pantry(db: DbDep, current_user: CurrentUser):
    """Get all ingredients in the user's pantry."""
    pantry_items = (
        db.query(UserIngredient)
        .filter(UserIngredient.user_id == current_user.id)
        .join(Ingredient)
        .all()
    )
    return [_to_pantry_read(item) for item in pantry_items]


@router.post("", response_model=PantryIngredientRead, status_code=status.HTTP_201_CREATED)
def add_to_pantry(payload: PantryAdd, db: DbDep, current_user: CurrentUser):
    """Add an ingredient to the user's pantry."""
    # Find or create ingredient
    ingredient = db.query(Ingredient).filter(Ingredient.name == payload.ingredient_name).first()

    if not ingredient:
        ingredient = Ingredient(name=payload.ingredient_name)
        db.add(ingredient)
        db.commit()
        db.refresh(ingredient)

    # Check if user already has this ingredient
    existing = (
        db.query(UserIngredient)
        .filter(
            UserIngredient.user_id == current_user.id,
            UserIngredient.ingredient_id == ingredient.id,
        )
        .first()
    )

    if existing:
        existing.quantity = payload.quantity
    else:
        existing = UserIngredient(
            user_id=current_user.id,
            ingredient_id=ingredient.id,
            quantity=payload.quantity,
        )
        db.add(existing)
    
    db.commit()
    db.refresh(existing)
    return _to_pantry_read(existing)


@router.delete("/{ingredient_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_pantry(ingredient_id: int, db: DbDep, current_user: CurrentUser):
    """Remove an ingredient from the user's pantry."""
    pantry_item = (
        db.query(UserIngredient)
        .filter(
            UserIngredient.id == ingredient_id,
            UserIngredient.user_id == current_user.id,
        )
        .first()
    )

    if not pantry_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingredient not found in pantry",
        )

    db.delete(pantry_item)
    db.commit()
    return None


@router.put("/{ingredient_id}", response_model=PantryIngredientRead)
def update_pantry_quantity(
    ingredient_id: int, payload: PantryUpdate, db: DbDep, current_user: CurrentUser
):
    """Update the quantity of an ingredient in the user's pantry."""
    pantry_item = (
        db.query(UserIngredient)
        .filter(
            UserIngredient.id == ingredient_id,
            UserIngredient.user_id == current_user.id,
        )
        .first()
    )

    if not pantry_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingredient not found in pantry",
        )

    pantry_item.quantity = payload.quantity
    db.commit()
    db.refresh(pantry_item)
    return _to_pantry_read(pantry_item)

