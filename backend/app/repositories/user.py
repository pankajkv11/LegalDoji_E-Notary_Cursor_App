"""User repository."""
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.user import User
from app.models.enums import UserRole, UserStatus
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, session):
        super().__init__(session, User)

    async def get_by_email(self, email: str) -> User | None:
        q = select(User).where(User.email == email)
        if hasattr(User, "deleted_at"):
            q = q.where(User.deleted_at.is_(None))
        result = await self.session.execute(q)
        return result.scalar_one_or_none()

    async def get_by_phone(self, phone: str) -> User | None:
        q = select(User).where(User.phone == phone)
        if hasattr(User, "deleted_at"):
            q = q.where(User.deleted_at.is_(None))
        result = await self.session.execute(q)
        return result.scalar_one_or_none()

    async def get_by_id_with_relations(self, id: str) -> User | None:
        q = select(User).where(User.id == id)
        if hasattr(User, "deleted_at"):
            q = q.where(User.deleted_at.is_(None))
        q = q.options(
            selectinload(User.addresses),
            selectinload(User.role_obj),
        )
        result = await self.session.execute(q)
        return result.scalar_one_or_none()
