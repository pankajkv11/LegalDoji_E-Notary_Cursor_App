"""Auth-related Pydantic schemas."""
from pydantic import BaseModel, EmailStr


class LoginInput(BaseModel):
    method: str  # EMAIL | PHONE | GOOGLE
    email: EmailStr | None = None
    phone: str | None = None
    password: str | None = None
    otp: str | None = None
    google_id_token: str | None = None


class SignupInput(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    otp: str | None = None
    accept_terms: bool


class RefreshTokenInput(BaseModel):
    refresh_token: str


class TokenPayload(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
    token_type: str = "bearer"


class ForgotPasswordInput(BaseModel):
    email: str | None = None
    phone: str | None = None


class ResetPasswordInput(BaseModel):
    token: str
    new_password: str


class ChangePasswordInput(BaseModel):
    current_password: str
    new_password: str
