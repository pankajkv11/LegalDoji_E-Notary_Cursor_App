"""Address repository."""
from sqlalchemy import select, cast, String

from app.models.address import Address
from app.repositories.base import BaseRepository


class AddressRepository(BaseRepository[Address]):
    def __init__(self, session):
        super().__init__(session, Address)

    async def get_by_user(self, user_id: str):
        q = select(Address).where(
            cast(Address.user_id, String) == user_id,
            Address.deleted_at.is_(None),
        )
        result = await self.session.execute(q)
        return list(result.scalars().all())
