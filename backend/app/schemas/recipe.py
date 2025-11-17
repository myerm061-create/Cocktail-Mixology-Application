from pydantic import BaseModel, Field


class MatchScore(BaseModel):
    """Match score for a cocktail based on pantry ingredients."""

    matched: int = Field(..., description="Number of ingredients matched")
    total: int = Field(..., description="Total number of ingredients")
    percentage: float = Field(..., description="Match percentage (0-100)")


class CocktailRecommendation(BaseModel):
    """Schema for a single cocktail recommendation."""

    id: str = Field(..., description="Cocktail ID from TheCocktailDB")
    name: str = Field(..., description="Cocktail name")
    thumbnail: str | None = Field(None, description="Thumbnail image URL")
    category: str | None = Field(None, description="Cocktail category")
    instructions: str | None = Field(None, description="Preparation instructions")
    ingredients: list[str] = Field(..., description="List of ingredient names")
    fully_makeable: bool = Field(..., description="Whether all ingredients are in pantry")
    missing_ingredients: list[str] = Field(
        default_factory=list, description="Ingredients missing from pantry"
    )
    match_score: MatchScore = Field(..., description="Match score details")


class RecommendationsResponse(BaseModel):
    """Schema for recommendations endpoint response."""

    cocktails: list[CocktailRecommendation] = Field(
        ..., description="List of recommended cocktails"
    )
    total_found: int = Field(..., description="Total number of cocktails found")
    fully_makeable_count: int = Field(
        ..., description="Number of fully makeable cocktails"
    )

