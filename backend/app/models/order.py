"""Order, Payment, Delivery models."""
from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import String, Integer, ForeignKey, Enum, DateTime, Date
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, SoftDeleteMixin
from app.models.enums import OrderType, OrderStatus, PaymentStatus, PaymentMethod, DeliveryStatus


class Order(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    order_number: Mapped[str] = mapped_column(
        String(32), unique=True, nullable=False, index=True
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )
    document_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("documents.id"), nullable=True, index=True
    )
    appointment_id: Mapped[str | None] = mapped_column(
        String(36), nullable=True, index=True
    )
    delivery_address_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("addresses.id"), nullable=True, index=True
    )
    type: Mapped[str] = mapped_column(Enum(OrderType), nullable=False)
    status: Mapped[str] = mapped_column(
        Enum(OrderStatus), nullable=False, default=OrderStatus.PENDING
    )
    base_price: Mapped[int] = mapped_column(Integer, nullable=False)
    delivery_fee: Mapped[int | None] = mapped_column(Integer, nullable=True)
    discount: Mapped[int | None] = mapped_column(Integer, nullable=True)
    total_amount: Mapped[int] = mapped_column(Integer, nullable=False)
    coupon_code: Mapped[str | None] = mapped_column(String(64), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="orders", lazy="joined")
    document: Mapped["Document | None"] = relationship(
        "Document", foreign_keys=[document_id], lazy="joined"
    )
    delivery_address: Mapped["Address | None"] = relationship(
        "Address", foreign_keys=[delivery_address_id], lazy="joined"
    )
    payment: Mapped["Payment | None"] = relationship(
        "Payment", back_populates="order", uselist=False, lazy="joined"
    )
    delivery: Mapped["Delivery | None"] = relationship(
        "Delivery", back_populates="order", uselist=False, lazy="joined"
    )
    appointment: Mapped["Appointment | None"] = relationship(
        "Appointment",
        primaryjoin="Order.appointment_id == Appointment.id",
        foreign_keys="[Order.appointment_id]",
        lazy="joined",
        viewonly=True,
    )

    def __repr__(self) -> str:
        return f"<Order {self.order_number}>"


class Payment(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "payments"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    order_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("orders.id"), nullable=False, index=True
    )
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    currency: Mapped[str] = mapped_column(String(8), nullable=False, default="INR")
    status: Mapped[str] = mapped_column(
        Enum(PaymentStatus), nullable=False, default=PaymentStatus.PENDING
    )
    method: Mapped[str] = mapped_column(
        Enum(PaymentMethod), nullable=False, default=PaymentMethod.UPI
    )
    razorpay_order_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    razorpay_payment_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    order: Mapped["Order"] = relationship("Order", back_populates="payment", lazy="joined")

    def __repr__(self) -> str:
        return f"<Payment {self.id} {self.status}>"


class Delivery(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "deliveries"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    order_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("orders.id"), nullable=False, index=True
    )
    document_name: Mapped[str] = mapped_column(String(512), nullable=False)
    status: Mapped[str] = mapped_column(
        Enum(DeliveryStatus), nullable=False, default=DeliveryStatus.PROCESSING
    )
    courier_partner: Mapped[str] = mapped_column(String(128), nullable=False)
    tracking_number: Mapped[str] = mapped_column(String(128), nullable=False)
    current_location: Mapped[str | None] = mapped_column(String(256), nullable=True)
    expected_delivery: Mapped[date | None] = mapped_column(Date, nullable=True)
    stages: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)

    order: Mapped["Order"] = relationship("Order", back_populates="delivery", lazy="joined")

    def __repr__(self) -> str:
        return f"<Delivery {self.tracking_number}>"
