"""Auth service: login, signup, refresh, logout."""
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.models.enums import UserRole, UserStatus
from app.repositories.user import UserRepository
from app.repositories.refresh_token import RefreshTokenRepository


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
    ) -> tuple[User, str, str, int]:
        if not accept_terms:
            raise ValueError("Terms must be accepted")
        existing = await self.user_repo.get_by_email(email)
        if existing:
            raise ValueError("Email already registered")
        user = User(
            name=name,
            email=email,
            phone=phone,
            hashed_password=hash_password(password),
            role=UserRole.USER,
            status=UserStatus.ACTIVE,
            email_verified=False,
            phone_verified=False,
        )
        await self.user_repo.add(user)
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

    async def login_phone_password(self, phone: str, password: str) -> tuple[User, str, str, int] | None:
        user = await self.user_repo.get_by_phone(phone)
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
