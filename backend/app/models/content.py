"""Service, FAQ, ContactSubmission, Review, PricingPlan models."""
from __future__ import annotations

import uuid

from sqlalchemy import String, Integer, Text, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, SoftDeleteMixin
from app.models.enums import FAQCategory


class Service(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "services"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    price: Mapped[str] = mapped_column(String(32), nullable=False)
    base_price: Mapped[int | None] = mapped_column(Integer, nullable=True)
    delivery_fee: Mapped[int | None] = mapped_column(Integer, nullable=True)
    flow: Mapped[list] = mapped_column(ARRAY(Text), nullable=False, default=list)
    features: Mapped[list] = mapped_column(ARRAY(Text), nullable=False, default=list)
    includes: Mapped[list] = mapped_column(ARRAY(Text), nullable=False, default=list)
    popular: Mapped[bool] = mapped_column(default=False)

    def __repr__(self) -> str:
        return f"<Service {self.name}>"


class FAQ(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "faqs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    category: Mapped[str] = mapped_column(Enum(FAQCategory), nullable=False)
    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)

    def __repr__(self) -> str:
        return f"<FAQ {self.id}>"


class ContactSubmission(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "contact_submissions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)

    def __repr__(self) -> str:
        return f"<ContactSubmission {self.id}>"


class Review(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "reviews"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )
    notary_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("notaries.id"), nullable=False, index=True
    )
    session_id: Mapped[str | None] = mapped_column(
        String(36), nullable=True, index=True
    )
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    def __repr__(self) -> str:
        return f"<Review {self.id}>"


class PricingPlan(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "pricing_plans"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    price: Mapped[str] = mapped_column(String(32), nullable=False)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    period: Mapped[str | None] = mapped_column(String(32), nullable=True)
    features: Mapped[list] = mapped_column(ARRAY(Text), nullable=False, default=list)
    popular: Mapped[bool] = mapped_column(default=False)
    cta: Mapped[str] = mapped_column(String(128), nullable=False)

    def __repr__(self) -> str:
        return f"<PricingPlan {self.name}>"
