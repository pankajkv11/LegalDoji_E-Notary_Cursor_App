"""Appointment repository."""
from datetime import date
from sqlalchemy import select, and_, cast, String

from app.models.appointment import Appointment
from app.models.enums import AppointmentStatus
from app.repositories.base import BaseRepository


class AppointmentRepository(BaseRepository[Appointment]):
    def __init__(self, session):
        super().__init__(session, Appointment)

    async def get_by_user(self, user_id: str, status: AppointmentStatus | None = None):
        q = select(Appointment).where(
            cast(Appointment.user_id, String) == user_id,
            Appointment.deleted_at.is_(None),
        )
        if status is not None:
            q = q.where(Appointment.status == status)
        result = await self.session.execute(q)
        return list(result.scalars().all())

    async def get_by_notary(self, notary_id: str, status: AppointmentStatus | None = None):
        q = select(Appointment).where(
            cast(Appointment.notary_id, String) == notary_id,
            Appointment.deleted_at.is_(None),
        )
        if status is not None:
            q = q.where(Appointment.status == status)
        result = await self.session.execute(q)
        return list(result.scalars().all())

    async def get_slots_for_notary(
        self,
        notary_id: str,
        start_date: date,
        end_date: date,
    ):
        """Return booked slots in range for conflict checking."""
        q = select(Appointment).where(
            cast(Appointment.notary_id, String) == notary_id,
            Appointment.deleted_at.is_(None),
            Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
            Appointment.scheduled_date >= start_date,
            Appointment.scheduled_date <= end_date,
        )
        result = await self.session.execute(q)
        return list(result.scalars().all())
