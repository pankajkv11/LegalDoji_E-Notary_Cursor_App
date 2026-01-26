"""Base repository with generic CRUD."""
from datetime import datetime, timezone
from typing import Generic, TypeVar, Type

from sqlalchemy import select, func, cast, String
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import Base

ModelT = TypeVar("ModelT", bound=Base)


class BaseRepository(Generic[ModelT]):
    def __init__(self, session: AsyncSession, model: Type[ModelT]):
        self.session = session
        self.model = model

    async def get(self, id: str) -> ModelT | None:
        # Cast id column to String to match VARCHAR type in database
        # This handles the case where the DB column is VARCHAR but model uses UUID(as_uuid=False)
        q = select(self.model).where(cast(self.model.id, String) == id)
        if hasattr(self.model, "deleted_at"):
            q = q.where(self.model.deleted_at.is_(None))
        result = await self.session.execute(q)
        return result.scalar_one_or_none()

    async def get_many(
        self,
        *,
        limit: int = 20,
        offset: int = 0,
        order_by=None,
    ):
        q = select(self.model)
        if hasattr(self.model, "deleted_at"):
            q = q.where(self.model.deleted_at.is_(None))
        if order_by is not None:
            q = q.order_by(order_by)
        q = q.limit(limit).offset(offset)
        result = await self.session.execute(q)
        return list(result.scalars().all())

    async def add(self, entity: ModelT) -> ModelT:
        self.session.add(entity)
        await self.session.flush()
        # Don't refresh - it causes type mismatch errors with UUID(as_uuid=False) and VARCHAR columns
        # The entity already has all the values we need after flush
        return entity

    async def delete_soft(self, entity: ModelT) -> None:
        if hasattr(entity, "deleted_at"):
            entity.deleted_at = datetime.now(timezone.utc)
            await self.session.flush()
        else:
            await self.session.delete(entity)
            await self.session.flush()

    async def count(self) -> int:
        q = select(func.count()).select_from(self.model)
        if hasattr(self.model, "deleted_at"):
            q = q.where(self.model.deleted_at.is_(None))
        result = await self.session.execute(q)
        return result.scalar() or 0
