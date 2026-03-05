"""Document and DocumentTemplate models."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import String, Integer, ForeignKey, Enum, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, SoftDeleteMixin
from app.models.enums import DocumentStatus, DocumentCategory


class DocumentTemplate(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "document_templates"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    slug: Mapped[str] = mapped_column(String(128), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(
        Enum(DocumentCategory), nullable=False
    )
    steps: Mapped[dict] = mapped_column(JSONB, nullable=False, default=list)
    default_values: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    field_configs: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    def __repr__(self) -> str:
        return f"<DocumentTemplate {self.slug}>"


class Document(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )
    notary_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("notaries.id"), nullable=True, index=True
    )
    order_id: Mapped[str | None] = mapped_column(
        String(36), nullable=True, index=True
    )
    template_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("document_templates.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    category: Mapped[str] = mapped_column(
        Enum(DocumentCategory), nullable=False
    )
    status: Mapped[str] = mapped_column(
        Enum(DocumentStatus), nullable=False, default=DocumentStatus.DRAFT
    )
    form_data: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    completion_percentage: Mapped[int | None] = mapped_column(Integer, nullable=True)
    current_step: Mapped[int | None] = mapped_column(Integer, nullable=True)
    pdf_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="documents", lazy="joined")
    notary: Mapped["Notary | None"] = relationship(
        "Notary", back_populates="documents", lazy="joined"
    )
    template: Mapped["DocumentTemplate"] = relationship(
        "DocumentTemplate", lazy="joined"
    )

    def __repr__(self) -> str:
        return f"<Document {self.id} {self.title}>"
