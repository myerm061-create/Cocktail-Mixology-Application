from pydantic import BaseModel

# Pydantic schema for user output
class UserOut(BaseModel):
    id: int
    email: str
    full_name: str | None = None
    provider: str

    class Config:
        from_attributes = True
