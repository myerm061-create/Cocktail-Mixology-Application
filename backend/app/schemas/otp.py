from pydantic import BaseModel, EmailStr, constr, field_validator

OTP_INTENTS = {"login", "verify", "reset", "delete"}


class OTPRequestIn(BaseModel):
    email: EmailStr
    intent: constr(strip_whitespace=True) = "login"

    @field_validator("intent")
    @classmethod
    def validate_intent(cls, v: str) -> str:
        v = v.lower().strip()
        if v not in OTP_INTENTS:
            raise ValueError(f"intent must be one of {sorted(OTP_INTENTS)}")
        return v


class OTPVerifyIn(BaseModel):
    email: EmailStr
    intent: constr(strip_whitespace=True)
    code: constr(min_length=4, max_length=8)

    @field_validator("intent")
    @classmethod
    def validate_intent(cls, v: str) -> str:
        v = v.lower().strip()
        if v not in OTP_INTENTS:
            raise ValueError(f"intent must be one of {sorted(OTP_INTENTS)}")
        return v


class ResetCompleteIn(BaseModel):
    email: EmailStr
    code: constr(min_length=4, max_length=8)
    new_password: constr(min_length=10)
