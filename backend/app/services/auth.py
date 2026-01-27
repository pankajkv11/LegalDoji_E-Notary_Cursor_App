"""Auth service: login, signup, refresh, logout."""
import uuid
import secrets
from datetime import datetime, timedelta, timezone

from jose import jwt, JWTError, ExpiredSignatureError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.config import get_settings
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.models.enums import UserRole, UserStatus
from app.repositories.user import UserRepository
from app.repositories.refresh_token import RefreshTokenRepository

# Simulated OTP for testing - in production, this would be sent via SMS/Email
SIMULATED_OTP = "123456"
TEMP_TOKEN_EXPIRY_SECONDS = 600  # 10 minutes

settings = get_settings()


def create_verification_token(user_id: str, email: str, phone: str, otp: str) -> str:
    """Create a JWT-based temp token for OTP verification."""
    payload = {
        "sub": user_id,
        "email": email,
        "phone": phone,
        "otp": otp,
        "type": "verification",
        "exp": datetime.now(timezone.utc) + timedelta(seconds=TEMP_TOKEN_EXPIRY_SECONDS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def decode_verification_token(token: str) -> dict | None:
    """Decode and validate a verification token."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        if payload.get("type") != "verification":
            return None
        return payload
    except ExpiredSignatureError:
        return None
    except JWTError:
        return None


class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repo = UserRepository(session)
        self.refresh_repo = RefreshTokenRepository(session)

    async def signup(
        self,
        name: str,
        email: str,
        phone: str,
        password: str,
        accept_terms: bool,
    ) -> dict:
        """
        Create a new user with PENDING_VERIFICATION status.
        Returns a temp token for OTP verification instead of auth tokens.
        """
        if not accept_terms:
            raise ValueError("Terms must be accepted")
        
        # Check email uniqueness
        existing_email = await self.user_repo.get_by_email(email)
        if existing_email:
            raise ValueError("Email already registered")
        
        # Check phone uniqueness
        existing_phone = await self.user_repo.get_by_phone(phone)
        if existing_phone:
            raise ValueError("Phone number already registered")
        
        # Create user with PENDING_VERIFICATION status
        user = User(
            name=name,
            email=email,
            phone=phone,
            hashed_password=hash_password(password),
            role=UserRole.USER,
            status=UserStatus.PENDING_VERIFICATION,
            email_verified=False,
            phone_verified=False,
        )
        await self.user_repo.add(user)
        await self.session.flush()
        
        # Generate JWT-based temp token for OTP verification (survives container restarts)
        temp_token = create_verification_token(
            user_id=str(user.id),
            email=email,
            phone=phone,
            otp=SIMULATED_OTP,  # In production, generate random OTP
        )
        
        # In production: Send OTP via SMS/Email here
        # For testing, OTP is always "123456"
        
        return {
            "success": True,
            "message": "Account created. Please verify with OTP sent to your phone.",
            "temp_token": temp_token,
            "expires_in": TEMP_TOKEN_EXPIRY_SECONDS,
            "user_id": str(user.id),
            "email": email,
            "phone": phone,
        }

    async def verify_otp(
        self,
        temp_token: str,
        otp: str,
    ) -> tuple[User, str, str, int] | None:
        """
        Verify OTP and activate user account.
        Returns auth tokens on success.
        """
        # Decode and validate temp token (JWT-based, survives container restarts)
        token_data = decode_verification_token(temp_token)
        if not token_data:
            raise ValueError("Invalid or expired verification token. Please signup again.")
        
        # Verify OTP
        if otp != token_data["otp"]:
            raise ValueError("Invalid OTP. Please try again.")
        
        # Get user and activate
        user = await self.user_repo.get(token_data["sub"])
        if not user:
            raise ValueError("User not found")
        
        if user.status == UserStatus.ACTIVE:
            raise ValueError("Account is already verified")
        
        # Activate user
        user.status = UserStatus.ACTIVE
        user.phone_verified = True  # Mark phone as verified since OTP was sent there
        await self.session.flush()
        
        # Generate auth tokens
        access, expires_in = create_access_token(str(user.id))
        refresh = create_refresh_token(str(user.id))
        rt = RefreshToken(
            user_id=user.id,
            token=refresh,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7),
        )
        self.session.add(rt)
        await self.session.flush()
        
        # Refresh user to ensure all attributes are loaded before returning
        await self.session.refresh(user)
        
        return user, access, refresh, expires_in

    async def resend_otp(
        self,
        temp_token: str,
    ) -> dict:
        """
        Resend OTP for verification.
        Returns a new temp token with extended expiry.
        """
        # Decode existing token
        token_data = decode_verification_token(temp_token)
        if not token_data:
            raise ValueError("Invalid or expired verification token. Please signup again.")
        
        # Verify user still exists and needs verification
        user = await self.user_repo.get(token_data["sub"])
        if not user:
            raise ValueError("User not found. Please signup again.")
        
        if user.status == UserStatus.ACTIVE:
            raise ValueError("Account is already verified. Please login.")
        
        # Generate new token with fresh OTP and extended expiry
        new_token = create_verification_token(
            user_id=token_data["sub"],
            email=token_data["email"],
            phone=token_data["phone"],
            otp=SIMULATED_OTP,  # In production, generate new random OTP
        )
        
        # In production: Send new OTP via SMS/Email here
        
        return {
            "success": True,
            "message": "OTP has been resent to your phone.",
            "expires_in": TEMP_TOKEN_EXPIRY_SECONDS,
            "new_token": new_token,  # Return new token with extended expiry
        }

    async def login_email_password(self, email: str, password: str) -> tuple[User, str, str, int] | None:
        user = await self.user_repo.get_by_email(email)
        if not user or not user.hashed_password:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        if user.status != UserStatus.ACTIVE:
            raise ValueError("Account is not active")
        access, expires_in = create_access_token(str(user.id))
        refresh = create_refresh_token(str(user.id))
        rt = RefreshToken(
            user_id=user.id,
            token=refresh,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7),
        )
        self.session.add(rt)
        await self.session.flush()
        return user, access, refresh, expires_in

    async def refresh_tokens(self, refresh_token: str) -> tuple[User, str, str, int] | None:
        rt = await self.refresh_repo.get_by_token(refresh_token)
        if not rt:
            return None
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            return None
        user = await self.user_repo.get(payload["sub"])
        if not user or user.status != UserStatus.ACTIVE:
            return None
        rt.revoked = True
        await self.session.flush()
        access, expires_in = create_access_token(str(user.id))
        new_refresh = create_refresh_token(str(user.id))
        new_rt = RefreshToken(
            user_id=user.id,
            token=new_refresh,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7),
        )
        self.session.add(new_rt)
        await self.session.flush()
        return user, access, new_refresh, expires_in

    async def logout(self, user_id: str) -> None:
        await self.refresh_repo.revoke_by_user(user_id)
