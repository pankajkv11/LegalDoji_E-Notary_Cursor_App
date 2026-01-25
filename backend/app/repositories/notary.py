"""Notary repository."""
from sqlalchemy import select

from app.models.notary import Notary
from app.repositories.base import BaseRepository


class NotaryRepository(BaseRepository[Notary]):
    def __init__(self, session):
        super().__init__(session, Notary)

    async def list_notaries(
        self,
        *,
        specialization: str | None = None,
        location: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ):
        q = select(Notary).where(Notary.deleted_at.is_(None))
        if specialization:
            q = q.where(Notary.specialization.any(specialization))
        if location:
            q = q.where(Notary.location.ilike(f"%{location}%"))
        q = q.limit(limit).offset(offset)
        result = await self.session.execute(q)
        return list(result.scalars().all())
