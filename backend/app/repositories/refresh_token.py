"""Refresh token repository."""
from sqlalchemy import select
from datetime import datetime, timezone

from app.models.refresh_token import RefreshToken
from app.repositories.base import BaseRepository


class RefreshTokenRepository(BaseRepository[RefreshToken]):
    def __init__(self, session):
        super().__init__(session, RefreshToken)

    async def get_by_token(self, token: str) -> RefreshToken | None:
        q = select(RefreshToken).where(
            RefreshToken.token == token,
            RefreshToken.revoked == False,
            RefreshToken.expires_at > datetime.now(timezone.utc),
        )
        result = await self.session.execute(q)
        return result.scalar_one_or_none()

    async def revoke_by_user(self, user_id: str) -> None:
        tokens = await self.session.execute(
            select(RefreshToken).where(RefreshToken.user_id == user_id)
        )
        for t in tokens.scalars().all():
            t.revoked = True
        await self.session.flush()
