"""User and Role models."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, String, Text, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, SoftDeleteMixin
from app.models.enums import UserRole, UserStatus, KycStatus


class Role(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "roles"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    permissions: Mapped[list] = mapped_column(ARRAY(Text), nullable=False, default=list)

    def __repr__(self) -> str:
        return f"<Role {self.name}>"


class User(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(
        Enum(UserRole), nullable=False, default=UserRole.USER
    )
    status: Mapped[str] = mapped_column(
        Enum(UserStatus), nullable=False, default=UserStatus.PENDING_VERIFICATION
    )
    email_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    phone_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    kyc_status: Mapped[str] = mapped_column(
        Enum(KycStatus), nullable=False, default=KycStatus.NOT_SUBMITTED
    )
    kyc_pan_number: Mapped[str | None] = mapped_column(String(10), nullable=True)
    kyc_aadhar_last4: Mapped[str | None] = mapped_column(String(4), nullable=True)
    kyc_data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    role_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("roles.id"), nullable=True
    )

    role_obj: Mapped["Role | None"] = relationship("Role", backref="users", lazy="joined")
    documents: Mapped[list["Document"]] = relationship(
        "Document", back_populates="user", lazy="selectin"
    )
    orders: Mapped[list["Order"]] = relationship(
        "Order", back_populates="user", lazy="selectin"
    )
    appointments: Mapped[list["Appointment"]] = relationship(
        "Appointment", back_populates="user", lazy="selectin"
    )
    addresses: Mapped[list["Address"]] = relationship(
        "Address", back_populates="user", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<User {self.email}>"
