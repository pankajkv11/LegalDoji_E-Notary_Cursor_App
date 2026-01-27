"""Appointment model."""
from __future__ import annotations

import uuid
from datetime import date

from sqlalchemy import String, Integer, ForeignKey, Enum, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, SoftDeleteMixin
from app.models.enums import AppointmentStatus


class Appointment(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "appointments"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )
    notary_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("notaries.id"), nullable=False, index=True
    )
    order_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("orders.id"), nullable=True, index=True
    )
    document_type: Mapped[str | None] = mapped_column(String(128), nullable=True)
    scheduled_date: Mapped[date] = mapped_column(Date, nullable=False)
    scheduled_time: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[str] = mapped_column(
        Enum(AppointmentStatus), nullable=False, default=AppointmentStatus.PENDING
    )
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    meeting_link: Mapped[str | None] = mapped_column(String(512), nullable=True)
    notes: Mapped[str | None] = mapped_column(String(1024), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="appointments", lazy="noload")
    notary: Mapped["Notary"] = relationship(
        "Notary", back_populates="appointments", lazy="noload"
    )
    order: Mapped["Order | None"] = relationship("Order", lazy="noload")

    def __repr__(self) -> str:
        return f"<Appointment {self.id} {self.scheduled_date}>"
