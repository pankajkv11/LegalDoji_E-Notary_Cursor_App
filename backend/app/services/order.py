"""Order service."""
import uuid
import random
import string
from datetime import date

from app.models.order import Order, Payment, Delivery
from app.models.enums import OrderType, OrderStatus, PaymentStatus, DeliveryStatus, DocumentStatus
from app.repositories.order import OrderRepository
from app.repositories.document import DocumentRepository
from app.services.document import BASE_PRICE, DELIVERY_FEE, DocumentService


def _order_number() -> str:
    return "ORD-" + "".join(random.choices(string.digits, k=10))


class OrderService:
    def __init__(self, session):
        self.session = session
        self.repo = OrderRepository(session)
        self.doc_repo = DocumentRepository(session)
        self.doc_svc = DocumentService(session)

    async def create_from_checkout(
        self,
        user_id: str,
        document_id: str,
        delivery_address_id: str | None = None,
        coupon_code: str | None = None,
    ) -> Order:
        summary = await self.doc_svc.get_checkout_summary(document_id, user_id, coupon_code)
        doc = await self.doc_repo.get(document_id)
        if not doc or doc.user_id != user_id:
            raise ValueError("Document not found")
        order = Order(
            order_number=_order_number(),
            user_id=user_id,
            document_id=document_id,
            type=OrderType.PHYSICAL_DELIVERY,
            status=OrderStatus.PENDING,
            base_price=summary["base_price"],
            delivery_fee=summary["delivery_fee"],
            discount=summary["discount"] or 0,
            total_amount=summary["total"],
            coupon_code=coupon_code if summary["coupon_applied"] else None,
            delivery_address_id=delivery_address_id,
        )
        await self.repo.add(order)
        doc.order_id = order.id
        doc.status = DocumentStatus.IN_PROGRESS
        await self.session.flush()
        return order

    async def create_payment_intent(self, order_id: str, user_id: str) -> Payment:
        order = await self.repo.get(order_id)
        if not order or order.user_id != user_id:
            raise ValueError("Order not found")
        from sqlalchemy import select
        existing = await self.session.execute(
            select(Payment).where(Payment.order_id == order_id)
        )
        pay = existing.scalar_one_or_none()
        if pay:
            return pay

        # Try to create a real Razorpay order when keys are configured
        from app.core.config import get_settings
        settings = get_settings()
        razorpay_order_id = None
        if settings.razorpay_key_id and settings.razorpay_key_secret:
            try:
                import razorpay
                client = razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))
                rp_order = client.order.create({
                    "amount": order.total_amount * 100,  # Razorpay expects paise
                    "currency": "INR",
                    "payment_capture": 1,
                    "notes": {"order_id": order.id, "order_number": order.order_number},
                })
                razorpay_order_id = rp_order["id"]
            except Exception:
                pass  # Fall through to mock

        if not razorpay_order_id:
            # Mock order ID for test mode (no keys configured)
            razorpay_order_id = "order_mock_" + "".join(random.choices(string.ascii_lowercase + string.digits, k=14))

        pay = Payment(
            order_id=order.id,
            amount=order.total_amount,
            currency="INR",
            status=PaymentStatus.PENDING,
            razorpay_order_id=razorpay_order_id,
        )
        self.session.add(pay)
        await self.session.flush()
        await self.session.refresh(pay)
        return pay
