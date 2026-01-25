"""Order repository."""
from sqlalchemy import select, desc, func

from app.models.order import Order
from app.models.enums import OrderStatus, OrderType
from app.repositories.base import BaseRepository


class OrderRepository(BaseRepository[Order]):
    def __init__(self, session):
        super().__init__(session, Order)

    async def get_by_user(
        self,
        user_id: str,
        *,
        status: OrderStatus | None = None,
        type: OrderType | None = None,
        limit: int = 20,
        offset: int = 0,
    ):
        q = select(Order).where(
            Order.user_id == user_id,
            Order.deleted_at.is_(None),
        )
        if status is not None:
            q = q.where(Order.status == status)
        if type is not None:
            q = q.where(Order.type == type)
        q = q.order_by(desc(Order.created_at)).limit(limit).offset(offset)
        result = await self.session.execute(q)
        return list(result.scalars().all())

    async def count_by_user(
        self,
        user_id: str,
        status: OrderStatus | None = None,
    ) -> int:
        q = select(func.count()).select_from(Order).where(
            Order.user_id == user_id,
            Order.deleted_at.is_(None),
        )
        if status is not None:
            q = q.where(Order.status == status)
        result = await self.session.execute(q)
        return result.scalar() or 0

    async def get_by_order_number(self, order_number: str) -> Order | None:
        q = select(Order).where(
            Order.order_number == order_number,
            Order.deleted_at.is_(None),
        )
        result = await self.session.execute(q)
        return result.scalar_one_or_none()
