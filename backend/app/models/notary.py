"""Notary, NotaryApplication, NotaryAvailability models."""
from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import String, Integer, Float, Boolean, ForeignKey, Enum, Text, Date, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, SoftDeleteMixin
from app.models.enums import NotaryApplicationStatus, DayOfWeek


class Notary(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "notaries"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id"), nullable=False, unique=True, index=True
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[str] = mapped_column(String(32), nullable=False)
    photo_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    license_number: Mapped[str] = mapped_column(String(128), nullable=False)
    bar_council_number: Mapped[str] = mapped_column(String(128), nullable=False)
    bar_council_state: Mapped[str] = mapped_column(String(64), nullable=False)
    enrollment_date: Mapped[date] = mapped_column(Date, nullable=False)
    experience: Mapped[int] = mapped_column(Integer, nullable=False)
    specialization: Mapped[list] = mapped_column(ARRAY(Text), nullable=False, default=list)
    languages: Mapped[list] = mapped_column(ARRAY(Text), nullable=False, default=list)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    consultation_fee: Mapped[int] = mapped_column(Integer, nullable=False)
    rating: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    reviews_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    completed_sessions: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    verification_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    bank_account_holder: Mapped[str | None] = mapped_column(String(255), nullable=True)
    bank_account_number: Mapped[str | None] = mapped_column(String(64), nullable=True)
    bank_ifsc: Mapped[str | None] = mapped_column(String(32), nullable=True)
    bank_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    bank_branch: Mapped[str | None] = mapped_column(String(128), nullable=True)

    user: Mapped["User"] = relationship("User", backref="notary_profile", lazy="noload")
    documents: Mapped[list["Document"]] = relationship(
        "Document", back_populates="notary", lazy="noload"
    )
    appointments: Mapped[list["Appointment"]] = relationship(
        "Appointment", back_populates="notary", lazy="noload"
    )
    availability: Mapped["NotaryAvailability | None"] = relationship(
        "NotaryAvailability", back_populates="notary", uselist=False, lazy="noload"
    )

    def __repr__(self) -> str:
        return f"<Notary {self.full_name}>"


class NotaryAvailability(Base, TimestampMixin):
    __tablename__ = "notary_availability"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    notary_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("notaries.id"), nullable=False, unique=True
    )
    days: Mapped[dict] = mapped_column(JSONB, nullable=False, default=list)
    break_start: Mapped[str | None] = mapped_column(String(8), nullable=True)
    break_end: Mapped[str | None] = mapped_column(String(8), nullable=True)

    notary: Mapped["Notary"] = relationship(
        "Notary", back_populates="availability", lazy="noload"
    )


class NotaryApplication(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "notary_applications"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    application_number: Mapped[str] = mapped_column(
        String(32), unique=True, nullable=False, index=True
    )
    user_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id"), nullable=True, index=True
    )
    first_name: Mapped[str] = mapped_column(String(128), nullable=False)
    middle_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    last_name: Mapped[str] = mapped_column(String(128), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(32), nullable=False)
    license_number: Mapped[str | None] = mapped_column(String(128), nullable=True)
    bar_council_number: Mapped[str | None] = mapped_column(String(128), nullable=True)
    experience: Mapped[str | None] = mapped_column(String(64), nullable=True)
    specialization: Mapped[str | None] = mapped_column(String(255), nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(
        Enum(NotaryApplicationStatus), nullable=False, default=NotaryApplicationStatus.PENDING
    )
    documents: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    applied_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    def __repr__(self) -> str:
        return f"<NotaryApplication {self.application_number}>"
