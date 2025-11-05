# backend models/user.py
from pydantic import BaseModel, EmailStr, Field, field_validator
from services.password_policy import validate_password, MIN_LEN

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
    password: str = Field(min_length=MIN_LEN)

    @field_validator("password")
    @classmethod
    def apply_policy(cls, v: str, values):
        email = values.get("email")
        errs = validate_password(v, str(email) if email else None)
        if errs:
            raise ValueError("; ".join(errs))
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
