"""SQLAlchemy declarative base and mixins."""
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def uuid4_str() -> str:
    return str(uuid.uuid4())


class Base(DeclarativeBase):
    """Declarative base for all models."""
    type_annotation_map = {
        dict[str, Any]: JSONB,
    }


class TimestampMixin:
    """createdAt, updatedAt."""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class SoftDeleteMixin:
    """deletedAt for soft delete."""
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, default=None
    )
