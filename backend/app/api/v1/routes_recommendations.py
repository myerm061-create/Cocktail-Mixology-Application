import asyncio
import re
from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.ingredient import Ingredient
from app.models.link_tables import UserIngredient
from app.models.user import User
from app.schemas.recipe import (
    CocktailRecommendation,
    MatchScore,
    RecommendationsResponse,
)

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

DbDep = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]

COCKTAILDB_BASE_URL = "https://www.thecocktaildb.com/api/json/v1/1"


def normalize_ingredient_name(name: str) -> str:
    """Normalize ingredient name for matching (simplified version of frontend logic)."""
    if not name:
        return ""
    # Remove punctuation, convert to lowercase, collapse spaces
    normalized = re.sub(r"[\(\)\[\]\{\}:,_\-–—]", " ", name.lower())
    normalized = re.sub(r"\s+", " ", normalized).strip()
    # Remove common filler words
    normalized = re.sub(
        r"\b(fresh|house|homemade|of|the|and|a|ml|oz|ounce|ounces|tsp|tbsp|dash|dashes)\b",
        "",
        normalized,
    )
    normalized = re.sub(r"\s+", " ", normalized).strip()
    # Basic singularization
    if normalized.endswith("ies") and len(normalized) > 3:
        normalized = normalized[:-3] + "y"
    elif normalized.endswith("s") and len(normalized) > 3:
        normalized = normalized[:-1]
    return normalized


def get_pantry_ingredient_names(db: Session, user_id: int) -> set[str]:
    """Get normalized ingredient names from user's pantry."""
    pantry_items = (
        db.query(UserIngredient)
        .filter(UserIngredient.user_id == user_id)
        .join(Ingredient)
        .all()
    )
    return {normalize_ingredient_name(item.ingredient.name) for item in pantry_items}


def parse_cocktail_ingredients(drink: dict) -> list[str]:
    """Extract ingredient names from CocktailDB drink data."""
    ingredients = []
    for i in range(1, 16):  # CocktailDB has up to 15 ingredients
        ingredient = drink.get(f"strIngredient{i}", "").strip()
        if ingredient:
            ingredients.append(ingredient)
    return ingredients


def is_fully_makeable(
    cocktail_ingredients: list[str], pantry_names: set[str]
) -> tuple[bool, list[str]]:
    """Check if cocktail is fully makeable from pantry and return missing ingredients."""
    missing = []
    for ingredient in cocktail_ingredients:
        normalized = normalize_ingredient_name(ingredient)
        if normalized and normalized not in pantry_names:
            missing.append(ingredient)
    return len(missing) == 0, missing


def get_match_score(cocktail_ingredients: list[str], pantry_names: set[str]) -> dict:
    """Calculate match score for a cocktail."""
    if not cocktail_ingredients:
        return {"matched": 0, "total": 0, "percentage": 0.0}

    matched = sum(
        1
        for ing in cocktail_ingredients
        if normalize_ingredient_name(ing) in pantry_names
    )
    total = len(cocktail_ingredients)
    return {
        "matched": matched,
        "total": total,
        "percentage": (matched / total * 100) if total > 0 else 0.0,
    }


@router.get("", response_model=RecommendationsResponse)
async def get_recommendations(
    db: DbDep,
    current_user: CurrentUser,
    limit: int = Query(default=20, ge=1, le=50),
    fully_makeable_only: bool = Query(default=False),
):
    """
    Get cocktail recommendations based on user's pantry ingredients.
    
    - Fetches cocktails from TheCocktailDB API
    - Filters by user's pantry ingredients
    - Returns cocktails with metadata about makeability
    """
    # Get user's pantry ingredients
    pantry_names = get_pantry_ingredient_names(db, current_user.id)

    if not pantry_names:
        return RecommendationsResponse(
            cocktails=[],
            total_found=0,
            fully_makeable_count=0,
        )

    # Fetch random cocktails from TheCocktailDB
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Fetch multiple random cocktails in parallel
            tasks = [
                client.get(f"{COCKTAILDB_BASE_URL}/random.php")
                for _ in range(min(limit * 2, 50))
            ]
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            
            cocktails_data = []
            for resp in responses:
                if isinstance(resp, Exception):
                    continue
                if resp.status_code != 200:
                    continue
                try:
                    data = resp.json()
                    if data and data.get("drinks") and len(data["drinks"]) > 0:
                        cocktails_data.append(data["drinks"][0])
                except Exception:
                    continue

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="CocktailDB API timeout",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching cocktails: {str(e)}",
        )

    # Process and filter cocktails
    results = []
    for drink in cocktails_data:
        try:
            ingredients = parse_cocktail_ingredients(drink)
            if not ingredients:
                continue

            fully_makeable, missing = is_fully_makeable(ingredients, pantry_names)
            match_score = get_match_score(ingredients, pantry_names)

            # Filter if requested
            if fully_makeable_only and not fully_makeable:
                continue

            results.append(
                CocktailRecommendation(
                    id=str(drink.get("idDrink", "")),
                    name=str(drink.get("strDrink", "")),
                    thumbnail=drink.get("strDrinkThumb"),
                    category=drink.get("strCategory"),
                    instructions=drink.get("strInstructions"),
                    ingredients=ingredients,
                    fully_makeable=fully_makeable,
                    missing_ingredients=missing,
                    match_score=MatchScore(**match_score),
                )
            )
        except Exception as e:
            # Skip cocktails that fail to process
            continue

    # Sort by: fully_makeable first, then by match percentage
    results.sort(
        key=lambda x: (not x.fully_makeable, -x.match_score.percentage)
    )

    # Limit results
    results = results[:limit]

    return RecommendationsResponse(
        cocktails=results,
        total_found=len(results),
        fully_makeable_count=sum(1 for r in results if r.fully_makeable),
    )

