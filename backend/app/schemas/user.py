from pydantic import BaseModel, EmailStr, Field, field_validator


# Pydantic schema for user output
class UserOut(BaseModel):
    id: int
    email: str
    full_name: str | None = None
    provider: str

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

    @field_validator("password")
    @classmethod
    def strong_enough(cls, v: str):
        if not any(ch.isdigit() for ch in v):
            raise ValueError("Password must include at least one number")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    id: int
    email: EmailStr

    class Config:
        orm_mode = True


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
