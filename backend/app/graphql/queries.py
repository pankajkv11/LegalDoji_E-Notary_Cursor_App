"""GraphQL queries."""
from datetime import date, timedelta
from typing import Optional, List

import strawberry
from sqlalchemy import select, func, desc

from app.graphql.context import Context
from app.graphql.types import (
    UserType,
    DocumentType,
    DocumentTemplateType,
    OrderGql,
    OrderConnectionType,
    AppointmentType,
    AddressType,
    NotaryType,
    CheckoutSummaryType,
    DeliveryType,
    ServiceType,
    FAQType,
    PricingPlanType,
    AdminStatsType,
    ReportRevenueByTypeType,
    TransactionType,
    PageInfoType,
    DocumentConnectionType,
    TimeSlotType,
)
from app.graphql.inputs import DocumentsFilterInput, OrdersFilterInput, ReportsFilterInput
from app.graphql.resolvers.helpers import (
    user_to_gql,
    doc_to_gql,
    template_to_gql,
    order_to_gql,
    appointment_to_gql,
    address_to_gql,
    notary_to_gql,
    delivery_to_gql,
    service_to_gql,
    faq_to_gql,
    pricing_plan_to_gql,
)
from app.models.user import User
from app.models.document import Document, DocumentTemplate
from app.models.order import Order, Payment
from app.models.appointment import Appointment
from app.models.address import Address
from app.models.notary import Notary
from app.models.content import Service, FAQ, PricingPlan
from app.models.enums import (
    DocumentStatus,
    DocumentCategory,
    OrderStatus,
    AppointmentStatus,
    NotaryApplicationStatus,
)
from app.services.user import UserService
from app.services.document import DocumentService
from app.repositories.order import OrderRepository
from app.repositories.notary import NotaryRepository
from app.repositories.document import DocumentRepository, DocumentTemplateRepository
from app.repositories.address import AddressRepository
from app.repositories.appointment import AppointmentRepository


@strawberry.type
class Query:
    @strawberry.field
    async def me(self, info: strawberry.types.Info) -> Optional[UserType]:
        ctx: Context = info.context
        user = ctx.user
        if not user:
            return None
        svc = UserService(ctx.session)
        u = await svc.get_me(user.id)
        if not u:
            return None
        perms = svc.permissions_for_user(u)
        return user_to_gql(u, perms)

    @strawberry.field
    async def user(self, info: strawberry.types.Info, id: str) -> Optional[UserType]:
        ctx: Context = info.context
        ctx.require_user()
        svc = UserService(ctx.session)
        u = await svc.get_by_id(id)
        if not u:
            return None
        perms = svc.permissions_for_user(u)
        return user_to_gql(u, perms)

    @strawberry.field
    async def notary(self, info: strawberry.types.Info, id: str) -> Optional[NotaryType]:
        ctx: Context = info.context
        repo = NotaryRepository(ctx.session)
        n = await repo.get(id)
        return notary_to_gql(n) if n else None

    @strawberry.field
    async def notaries(
        self,
        info: strawberry.types.Info,
        specialization: Optional[str] = None,
        location: Optional[str] = None,
    ) -> List[NotaryType]:
        ctx: Context = info.context
        repo = NotaryRepository(ctx.session)
        items = await repo.list_notaries(
            specialization=specialization,
            location=location,
        )
        return [notary_to_gql(n) for n in items]

    @strawberry.field
    async def document(self, info: strawberry.types.Info, id: str) -> Optional[DocumentType]:
        ctx: Context = info.context
        ctx.require_user()
        repo = DocumentRepository(ctx.session)
        d = await repo.get(id)
        return doc_to_gql(d) if d and d.user_id == ctx.user.id else None

    @strawberry.field
    async def my_documents(
        self,
        info: strawberry.types.Info,
        filter: Optional[DocumentsFilterInput] = None,
    ) -> DocumentConnectionType:
        ctx: Context = info.context
        user = ctx.require_user()
        repo = DocumentRepository(ctx.session)
        status = DocumentStatus(filter.status) if filter and filter.status else None
        cat = DocumentCategory(filter.category) if filter and filter.category else None
        limit = (filter and filter.limit) or 20
        offset = (filter and filter.offset) or 0
        nodes = await repo.get_by_user(user.id, status=status, limit=limit, offset=offset)
        total = await repo.count_by_user(user.id, status=status)
        page_info = PageInfoType(
            has_next_page=offset + len(nodes) < total,
            has_previous_page=offset > 0,
            total_count=total,
        )
        return DocumentConnectionType(
            nodes=[doc_to_gql(d) for d in nodes],
            page_info=page_info,
        )

    @strawberry.field
    async def document_templates(
        self,
        info: strawberry.types.Info,
        category: Optional[str] = None,
    ) -> List[DocumentTemplateType]:
        ctx: Context = info.context
        repo = DocumentTemplateRepository(ctx.session)
        cat = None
        if category:
            try:
                cat = DocumentCategory(category)
            except ValueError:
                pass
        items = await repo.list_by_category(cat)
        return [template_to_gql(t) for t in items]

    @strawberry.field
    async def document_template(
        self,
        info: strawberry.types.Info,
        slug: str,
    ) -> Optional[DocumentTemplateType]:
        ctx: Context = info.context
        repo = DocumentTemplateRepository(ctx.session)
        t = await repo.get_by_slug(slug)
        return template_to_gql(t) if t else None

    @strawberry.field
    async def order(self, info: strawberry.types.Info, id: str) -> Optional[OrderGql]:
        ctx: Context = info.context
        user = ctx.require_user()
        repo = OrderRepository(ctx.session)
        o = await repo.get(id)
        return order_to_gql(o) if o and o.user_id == user.id else None

    @strawberry.field
    async def my_orders(
        self,
        info: strawberry.types.Info,
        filter: Optional[OrdersFilterInput] = None,
    ) -> OrderConnectionType:
        ctx: Context = info.context
        user = ctx.require_user()
        repo = OrderRepository(ctx.session)
        from app.models.enums import OrderType as OrderTypeEnum
        status = OrderStatus(filter.status) if filter and filter.status else None
        type_ = OrderTypeEnum(filter.type) if filter and filter.type else None
        limit = (filter and filter.limit) or 20
        offset = (filter and filter.offset) or 0
        nodes = await repo.get_by_user(user.id, status=status, type=type_, limit=limit, offset=offset)
        total = await repo.count_by_user(user.id, status=status)
        page_info = PageInfoType(
            has_next_page=offset + len(nodes) < total,
            has_previous_page=offset > 0,
            total_count=total,
        )
        return OrderConnectionType(
            nodes=[order_to_gql(o) for o in nodes],
            page_info=page_info,
        )

    @strawberry.field
    async def checkout_summary(
        self,
        info: strawberry.types.Info,
        document_id: str,
        coupon_code: Optional[str] = None,
    ) -> CheckoutSummaryType:
        ctx: Context = info.context
        user = ctx.require_user()
        svc = DocumentService(ctx.session)
        s = await svc.get_checkout_summary(document_id, user.id, coupon_code)
        return CheckoutSummaryType(
            base_price=s["base_price"],
            delivery_fee=s["delivery_fee"],
            subtotal=s["subtotal"],
            discount=s["discount"],
            total=s["total"],
            coupon_applied=s["coupon_applied"],
        )

    @strawberry.field
    async def appointment(self, info: strawberry.types.Info, id: str) -> Optional[AppointmentType]:
        ctx: Context = info.context
        user = ctx.require_user()
        result = await ctx.session.execute(
            select(Appointment).where(
                Appointment.id == id,
                Appointment.deleted_at.is_(None),
            )
        )
        a = result.scalar_one_or_none()
        if not a or a.user_id != user.id:
            return None
        return appointment_to_gql(a)

    @strawberry.field
    async def my_appointments(
        self,
        info: strawberry.types.Info,
        status: Optional[str] = None,
    ) -> List[AppointmentType]:
        ctx: Context = info.context
        user = ctx.require_user()
        repo = AppointmentRepository(ctx.session)
        st = AppointmentStatus(status) if status else None
        items = await repo.get_by_user(user.id, status=st)
        return [appointment_to_gql(a) for a in items]

    @strawberry.field
    async def available_slots(
        self,
        info: strawberry.types.Info,
        notary_id: str,
        start_date: str,
        end_date: str,
    ) -> List[TimeSlotType]:
        ctx: Context = info.context
        start = date.fromisoformat(start_date)
        end = date.fromisoformat(end_date)
        out = []
        current = start
        while current <= end:
            out.append(
                TimeSlotType(
                    date=current,
                    slots=[
                        "09:00 AM", "10:00 AM", "11:00 AM",
                        "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
                    ],
                )
            )
            current += timedelta(days=1)
        return out

    @strawberry.field
    async def delivery(self, info: strawberry.types.Info, order_id: str) -> Optional[DeliveryType]:
        ctx: Context = info.context
        from app.models.order import Delivery
        user = ctx.require_user()
        result = await ctx.session.execute(
            select(Order).where(Order.id == order_id, Order.user_id == user.id)
        )
        o = result.scalar_one_or_none()
        if not o or not o.delivery:
            return None
        return delivery_to_gql(o.delivery)

    @strawberry.field
    async def my_deliveries(self, info: strawberry.types.Info) -> List[DeliveryType]:
        ctx: Context = info.context
        from app.models.order import Delivery
        user = ctx.require_user()
        result = await ctx.session.execute(
            select(Delivery)
            .join(Order, Order.id == Delivery.order_id)
            .where(Order.user_id == user.id, Order.deleted_at.is_(None), Delivery.deleted_at.is_(None))
        )
        items = result.scalars().all()
        return [delivery_to_gql(d) for d in items]

    @strawberry.field
    async def services(self, info: strawberry.types.Info) -> List[ServiceType]:
        ctx: Context = info.context
        result = await ctx.session.execute(
            select(Service).where(Service.deleted_at.is_(None))
        )
        items = result.scalars().all()
        return [service_to_gql(s) for s in items]

    @strawberry.field
    async def faqs(
        self,
        info: strawberry.types.Info,
        category: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[FAQType]:
        ctx: Context = info.context
        q = select(FAQ).where(FAQ.deleted_at.is_(None))
        if category:
            from app.models.enums import FAQCategory
            q = q.where(FAQ.category == FAQCategory(category))
        if search:
            q = q.where(FAQ.question.ilike(f"%{search}%") | FAQ.answer.ilike(f"%{search}%"))
        result = await ctx.session.execute(q)
        return [faq_to_gql(f) for f in result.scalars().all()]

    @strawberry.field
    async def pricing_plans(self, info: strawberry.types.Info) -> List[PricingPlanType]:
        ctx: Context = info.context
        result = await ctx.session.execute(
            select(PricingPlan).where(PricingPlan.deleted_at.is_(None))
        )
        items = result.scalars().all()
        return [pricing_plan_to_gql(p) for p in items]

    @strawberry.field
    async def admin_stats(self, info: strawberry.types.Info) -> AdminStatsType:
        ctx: Context = info.context
        user = ctx.require_user()
        if user.role.value != "ADMIN":
            raise PermissionError("Admin only")
        from app.models.notary import NotaryApplication
        r = await ctx.session.execute(select(func.count()).select_from(User).where(User.deleted_at.is_(None)))
        users_c = r.scalar()
        r = await ctx.session.execute(select(func.count()).select_from(Document).where(Document.deleted_at.is_(None)))
        docs_c = r.scalar()
        r = await ctx.session.execute(select(func.count()).select_from(Notary).where(Notary.deleted_at.is_(None)))
        not_c = r.scalar()
        r = await ctx.session.execute(
            select(func.count()).select_from(NotaryApplication).where(
                NotaryApplication.status == NotaryApplicationStatus.PENDING
            )
        )
        app_c = r.scalar()
        r = await ctx.session.execute(
            select(func.count()).select_from(Order).where(
                Order.deleted_at.is_(None),
                Order.status.in_([OrderStatus.PENDING, OrderStatus.PAID, OrderStatus.PROCESSING]),
            )
        )
        orders_c = r.scalar()
        return AdminStatsType(
            total_users=users_c or 0,
            total_documents=docs_c or 0,
            active_notaries=not_c or 0,
            pending_applications=app_c or 0,
            revenue_month=0.0,
            pending_orders=orders_c or 0,
            active_sessions=0,
            support_tickets=0,
        )
