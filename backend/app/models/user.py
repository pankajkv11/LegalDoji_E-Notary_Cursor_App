"""User and Role models."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, String, Text, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, SoftDeleteMixin
from app.models.enums import UserRole, UserStatus


class Role(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "roles"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    permissions: Mapped[list] = mapped_column(ARRAY(Text), nullable=False, default=list)

    def __repr__(self) -> str:
        return f"<Role {self.name}>"


class User(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4())
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
    role_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=False), ForeignKey("roles.id"), nullable=True
    )

    role_obj: Mapped["Role | None"] = relationship("Role", backref="users", lazy="noload")
    documents: Mapped[list["Document"]] = relationship(
        "Document", back_populates="user", lazy="noload"
    )
    orders: Mapped[list["Order"]] = relationship(
        "Order", back_populates="user", lazy="noload"
    )
    appointments: Mapped[list["Appointment"]] = relationship(
        "Appointment", back_populates="user", lazy="noload"
    )
    addresses: Mapped[list["Address"]] = relationship(
        "Address", back_populates="user", lazy="noload"
    )

    def __repr__(self) -> str:
        return f"<User {self.email}>"
