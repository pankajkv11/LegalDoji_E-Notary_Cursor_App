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
    AdminUserType,
    AdminDocumentType,
    ReportRevenueByTypeType,
    TransactionType,
    TopNotaryReportType,
    PageInfoType,
    DocumentConnectionType,
    TimeSlotType,
    NotaryAvailabilityType,
    NotaryApplicationType,
    ReviewWithUserType,
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


def _hourly_slots(start: str, end: str, break_start: str | None, break_end: str | None) -> list[str]:
    """Generate hourly AM/PM slots between HH:MM start and end, skipping break window."""
    def _h(t: str) -> int:
        return int(t.split(":")[0])

    def _fmt(h: int) -> str:
        period = "AM" if h < 12 else "PM"
        h12 = h % 12 or 12
        return f"{h12:02d}:00 {period}"

    bs = _h(break_start) if break_start else None
    be = _h(break_end) if break_end else None
    return [
        _fmt(h)
        for h in range(_h(start), _h(end))
        if not (bs is not None and be is not None and bs <= h < be)
    ]
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

        from app.models.notary import NotaryAvailability as NotaryAvailabilityModel
        r = await ctx.session.execute(
            select(NotaryAvailabilityModel).where(NotaryAvailabilityModel.notary_id == notary_id)
        )
        avail = r.scalar_one_or_none()

        repo = AppointmentRepository(ctx.session)
        booked = await repo.get_slots_for_notary(notary_id, start, end)
        booked_set = {(str(b.scheduled_date), b.scheduled_time) for b in booked}

        day_names = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        out = []
        current = start
        while current <= end:
            day_name = day_names[current.weekday()]
            if avail and avail.days:
                day_data = next(
                    (d for d in avail.days if d.get("day") == day_name and d.get("enabled")),
                    None,
                )
                if day_data:
                    slots = []
                    for slot_range in day_data.get("slots", []):
                        for s in _hourly_slots(
                            slot_range.get("start", "09:00"),
                            slot_range.get("end", "17:00"),
                            avail.break_start,
                            avail.break_end,
                        ):
                            if (str(current), s) not in booked_set:
                                slots.append(s)
                    if slots:
                        out.append(TimeSlotType(date=current, slots=slots))
                current += timedelta(days=1)
                continue
            # No saved availability — use defaults
            default = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"]
            slots = [s for s in default if (str(current), s) not in booked_set]
            if slots:
                out.append(TimeSlotType(date=current, slots=slots))
            current += timedelta(days=1)
        return out

    @strawberry.field
    async def my_notary_profile(self, info: strawberry.types.Info) -> Optional[NotaryType]:
        ctx: Context = info.context
        user = ctx.require_user()
        r = await ctx.session.execute(select(Notary).where(Notary.user_id == user.id))
        n = r.scalar_one_or_none()
        return notary_to_gql(n) if n else None

    @strawberry.field
    async def my_notary_availability(self, info: strawberry.types.Info) -> Optional[NotaryAvailabilityType]:
        ctx: Context = info.context
        user = ctx.require_user()
        from app.models.notary import NotaryAvailability as NotaryAvailabilityModel
        r = await ctx.session.execute(select(Notary).where(Notary.user_id == user.id))
        n = r.scalar_one_or_none()
        if not n:
            return None
        ra = await ctx.session.execute(
            select(NotaryAvailabilityModel).where(NotaryAvailabilityModel.notary_id == n.id)
        )
        avail = ra.scalar_one_or_none()
        if not avail:
            return None
        return NotaryAvailabilityType(days=avail.days, break_start=avail.break_start, break_end=avail.break_end)

    @strawberry.field
    async def notary_appointments(
        self,
        info: strawberry.types.Info,
        status: Optional[str] = None,
    ) -> List[AppointmentType]:
        ctx: Context = info.context
        user = ctx.require_user()
        r = await ctx.session.execute(select(Notary).where(Notary.user_id == user.id))
        notary = r.scalar_one_or_none()
        if not notary:
            return []
        repo = AppointmentRepository(ctx.session)
        st = AppointmentStatus(status) if status else None
        items = await repo.get_by_notary(notary.id, status=st)
        result = []
        for a in items:
            client_user = await ctx.session.get(User, a.user_id)
            result.append(appointment_to_gql(a, client_user))
        return result

    @strawberry.field
    async def notary_applications(
        self,
        info: strawberry.types.Info,
        status: Optional[str] = None,
    ) -> List[NotaryApplicationType]:
        ctx: Context = info.context
        user = ctx.require_user()
        if user.role.value != "ADMIN":
            raise PermissionError("Admin only")
        from app.models.notary import NotaryApplication
        q = select(NotaryApplication)
        if status:
            q = q.where(NotaryApplication.status == NotaryApplicationStatus(status))
        q = q.order_by(desc(NotaryApplication.applied_at))
        result = await ctx.session.execute(q)
        items = result.scalars().all()
        return [
            NotaryApplicationType(
                id=a.id,
                application_number=a.application_number,
                user_id=a.user_id,
                first_name=a.first_name,
                middle_name=a.middle_name,
                last_name=a.last_name,
                email=a.email,
                phone=a.phone,
                license_number=a.license_number,
                bar_council_number=a.bar_council_number,
                experience=a.experience,
                specialization=a.specialization,
                location=a.location,
                status=a.status.value,
                applied_at=a.applied_at,
                reviewed_at=a.reviewed_at,
                created_at=a.created_at,
                updated_at=a.updated_at,
                deleted_at=a.deleted_at,
            )
            for a in items
        ]

    @strawberry.field
    async def my_notary_reviews(self, info: strawberry.types.Info) -> List[ReviewWithUserType]:
        ctx: Context = info.context
        user = ctx.require_user()
        r = await ctx.session.execute(select(Notary).where(Notary.user_id == user.id))
        notary = r.scalar_one_or_none()
        if not notary:
            return []
        from app.models.content import Review
        rv = await ctx.session.execute(
            select(Review)
            .where(Review.notary_id == notary.id, Review.deleted_at.is_(None))
            .order_by(desc(Review.created_at))
        )
        reviews = rv.scalars().all()
        result = []
        for rev in reviews:
            reviewer = await ctx.session.get(User, rev.user_id)
            name = reviewer.name if reviewer else "Anonymous"
            initials = "".join(p[0].upper() for p in name.split()[:2]) if name else "?"
            result.append(ReviewWithUserType(
                id=rev.id,
                user_id=rev.user_id,
                notary_id=rev.notary_id,
                session_id=rev.session_id,
                rating=rev.rating,
                comment=rev.comment,
                reviewer_name=name,
                reviewer_initials=initials,
                created_at=rev.created_at,
                updated_at=rev.updated_at,
                deleted_at=rev.deleted_at,
            ))
        return result

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
        from datetime import datetime, timezone
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
        # Revenue this calendar month (paid/delivered orders, total_amount stored in paise)
        now = datetime.now(timezone.utc)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        r = await ctx.session.execute(
            select(func.coalesce(func.sum(Order.total_amount), 0)).where(
                Order.deleted_at.is_(None),
                Order.status.in_([OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.NOTARIZED, OrderStatus.SHIPPED, OrderStatus.DELIVERED]),
                Order.created_at >= month_start,
            )
        )
        revenue_paise = r.scalar() or 0
        return AdminStatsType(
            total_users=users_c or 0,
            total_documents=docs_c or 0,
            active_notaries=not_c or 0,
            pending_applications=app_c or 0,
            revenue_month=round(revenue_paise / 100, 2),
            pending_orders=orders_c or 0,
            active_sessions=0,
            support_tickets=0,
        )

    @strawberry.field
    async def admin_list_users(
        self,
        info: strawberry.types.Info,
        role: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[AdminUserType]:
        ctx: Context = info.context
        user = ctx.require_user()
        if user.role.value != "ADMIN":
            raise PermissionError("Admin only")
        q = select(User).where(User.deleted_at.is_(None))
        if role:
            from app.models.enums import UserRole as UserRoleEnum
            q = q.where(User.role == UserRoleEnum(role))
        if status:
            from app.models.enums import UserStatus as UserStatusEnum
            q = q.where(User.status == UserStatusEnum(status))
        if search:
            like = f"%{search}%"
            from sqlalchemy import or_
            q = q.where(or_(User.name.ilike(like), User.email.ilike(like), User.phone.ilike(like)))
        q = q.order_by(desc(User.created_at))
        result = await ctx.session.execute(q)
        users = result.scalars().all()
        out = []
        for u in users:
            doc_count_r = await ctx.session.execute(
                select(func.count()).select_from(Document).where(
                    Document.user_id == u.id, Document.deleted_at.is_(None)
                )
            )
            doc_count = doc_count_r.scalar() or 0
            out.append(AdminUserType(
                id=u.id,
                email=u.email,
                phone=u.phone,
                name=u.name,
                role=u.role.value,
                status=u.status.value,
                document_count=doc_count,
                created_at=u.created_at,
                updated_at=u.updated_at,
                deleted_at=u.deleted_at,
                kyc_status=u.kyc_status.value if u.kyc_status else "NOT_SUBMITTED",
                kyc_pan_number=u.kyc_pan_number,
                kyc_aadhar_last4=u.kyc_aadhar_last4,
                kyc_data=u.kyc_data,
            ))
        return out

    @strawberry.field
    async def admin_list_documents(
        self,
        info: strawberry.types.Info,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[AdminDocumentType]:
        ctx: Context = info.context
        user = ctx.require_user()
        if user.role.value != "ADMIN":
            raise PermissionError("Admin only")
        q = select(Document).where(Document.deleted_at.is_(None))
        if status:
            q = q.where(Document.status == DocumentStatus(status))
        if search:
            like = f"%{search}%"
            from sqlalchemy import or_
            q = q.where(or_(Document.title.ilike(like), Document.id.ilike(like)))
        q = q.order_by(desc(Document.created_at))
        result = await ctx.session.execute(q)
        docs = result.scalars().all()
        out = []
        for d in docs:
            # Resolve client
            client_user = await ctx.session.get(User, d.user_id) if d.user_id else None
            # Resolve notary
            notary_name = None
            if d.notary_id:
                notary_obj = await ctx.session.get(Notary, d.notary_id)
                notary_name = notary_obj.full_name if notary_obj else None
            # Resolve order amount
            order_amount = None
            if d.order_id:
                order_obj = await ctx.session.get(Order, d.order_id)
                order_amount = order_obj.total_amount if order_obj else None
            out.append(AdminDocumentType(
                id=d.id,
                user_id=d.user_id,
                notary_id=d.notary_id,
                order_id=d.order_id,
                template_slug=d.template.slug if d.template else '',
                title=d.title,
                category=d.category.value,
                status=d.status.value,
                completion_percentage=d.completion_percentage,
                pdf_url=d.pdf_url,
                client_name=client_user.name if client_user else None,
                client_email=client_user.email if client_user else None,
                notary_name=notary_name,
                order_amount=order_amount,
                created_at=d.created_at,
                updated_at=d.updated_at,
                deleted_at=d.deleted_at,
            ))
        return out

    @strawberry.field
    async def admin_get_settings(self, info: strawberry.types.Info) -> strawberry.scalars.JSON:
        ctx: Context = info.context
        user = ctx.require_user()
        if user.role.value != "ADMIN":
            raise PermissionError("Admin only")
        from app.models.admin import AdminSettings
        r = await ctx.session.execute(select(AdminSettings).where(AdminSettings.key == "main"))
        row = r.scalar_one_or_none()
        return (row.value if row else {}) or {}

    @strawberry.field
    async def admin_list_notaries(
        self,
        info: strawberry.types.Info,
        search: Optional[str] = None,
        is_verified: Optional[bool] = None,
    ) -> List[NotaryType]:
        ctx: Context = info.context
        user = ctx.require_user()
        if user.role.value != "ADMIN":
            raise PermissionError("Admin only")
        q = select(Notary).where(Notary.deleted_at.is_(None))
        if is_verified is not None:
            q = q.where(Notary.is_verified == is_verified)
        if search:
            like = f"%{search}%"
            from sqlalchemy import or_
            q = q.where(or_(
                Notary.full_name.ilike(like),
                Notary.email.ilike(like),
                Notary.license_number.ilike(like),
                Notary.location.ilike(like),
            ))
        q = q.order_by(desc(Notary.created_at))
        result = await ctx.session.execute(q)
        return [notary_to_gql(n) for n in result.scalars().all()]

    # ── Admin Report Queries ──────────────────────────────────────────────────

    def _report_start(self, date_range: str):
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        if date_range == "today":
            return now.replace(hour=0, minute=0, second=0, microsecond=0)
        if date_range == "last7days":
            return now - timedelta(days=7)
        if date_range == "last90days":
            return now - timedelta(days=90)
        if date_range == "thisyear":
            return now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        return now - timedelta(days=30)  # last30days default

    @strawberry.field
    async def admin_revenue_by_type(
        self,
        info: strawberry.types.Info,
        date_range: Optional[str] = "last30days",
    ) -> List[ReportRevenueByTypeType]:
        ctx: Context = info.context
        user = ctx.require_user()
        if user.role.value != "ADMIN":
            raise PermissionError("Admin only")
        start = self._report_start(date_range or "last30days")
        paid_statuses = [OrderStatus.PAID, OrderStatus.NOTARIZED, OrderStatus.SHIPPED, OrderStatus.DELIVERED]
        q = (
            select(
                Document.template_id,
                func.count(Order.id).label("cnt"),
                func.coalesce(func.sum(Order.total_amount), 0).label("revenue"),
            )
            .join(Order, Order.document_id == Document.id)
            .where(
                Order.deleted_at.is_(None),
                Order.status.in_(paid_statuses),
                Order.created_at >= start,
            )
            .group_by(Document.template_id)
        )
        result = await ctx.session.execute(q)
        rows = result.fetchall()
        template_ids = [r.template_id for r in rows if r.template_id]
        tmpl_map: dict = {}
        if template_ids:
            tr = await ctx.session.execute(
                select(DocumentTemplate.id, DocumentTemplate.title).where(DocumentTemplate.id.in_(template_ids))
            )
            tmpl_map = {row.id: row.title for row in tr.fetchall()}
        total_rev = sum(r.revenue for r in rows) or 1
        items = sorted(rows, key=lambda r: r.revenue, reverse=True)[:10]
        return [
            ReportRevenueByTypeType(
                type=tmpl_map.get(r.template_id, "Other"),
                amount=round(r.revenue / 100, 2),
                count=r.cnt,
                percentage=round(r.revenue / total_rev * 100),
            )
            for r in items
        ]

    @strawberry.field
    async def admin_recent_transactions(
        self,
        info: strawberry.types.Info,
        date_range: Optional[str] = "last30days",
        limit: int = 10,
    ) -> List[TransactionType]:
        ctx: Context = info.context
        user = ctx.require_user()
        if user.role.value != "ADMIN":
            raise PermissionError("Admin only")
        start = self._report_start(date_range or "last30days")
        q = (
            select(Order)
            .where(Order.deleted_at.is_(None), Order.created_at >= start)
            .order_by(desc(Order.created_at))
            .limit(limit)
        )
        result = await ctx.session.execute(q)
        orders = result.scalars().all()
        txns = []
        for o in orders:
            doc_title = "Document"
            if o.document and o.document.template_id:
                tr = await ctx.session.execute(
                    select(DocumentTemplate.title).where(DocumentTemplate.id == o.document.template_id)
                )
                row = tr.fetchone()
                doc_title = row[0] if row else "Document"
            elif not o.document:
                doc_title = "Consultation"
            client = o.user.name if o.user else "Unknown"
            status_val = o.status.value.lower() if hasattr(o.status, "value") else str(o.status).lower()
            if status_val in ("paid", "notarized", "shipped", "delivered"):
                status_val = "completed"
            txns.append(TransactionType(
                id=f"TXN-{o.order_number}",
                document=doc_title,
                client=client,
                amount=o.total_amount,
                date=o.created_at.date(),
                time=o.created_at.strftime("%I:%M %p"),
                status=status_val,
            ))
        return txns

    @strawberry.field
    async def admin_monthly_revenue(
        self,
        info: strawberry.types.Info,
        months: int = 6,
    ) -> strawberry.scalars.JSON:
        ctx: Context = info.context
        user = ctx.require_user()
        if user.role.value != "ADMIN":
            raise PermissionError("Admin only")
        import calendar
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        paid_statuses = [OrderStatus.PAID, OrderStatus.NOTARIZED, OrderStatus.SHIPPED, OrderStatus.DELIVERED]
        data = []
        for i in range(months - 1, -1, -1):
            m = now.month - i
            y = now.year
            while m <= 0:
                m += 12
                y -= 1
            m_start = datetime(y, m, 1, tzinfo=timezone.utc)
            last_day = calendar.monthrange(y, m)[1]
            m_end = datetime(y, m, last_day, 23, 59, 59, tzinfo=timezone.utc)
            r = await ctx.session.execute(
                select(func.coalesce(func.sum(Order.total_amount), 0)).where(
                    Order.deleted_at.is_(None),
                    Order.status.in_(paid_statuses),
                    Order.created_at >= m_start,
                    Order.created_at <= m_end,
                )
            )
            rev = r.scalar() or 0
            data.append({"month": m_start.strftime("%b"), "revenue": round(rev / 100, 2)})
        return data

    @strawberry.field
    async def admin_top_notaries(
        self,
        info: strawberry.types.Info,
        date_range: Optional[str] = "last30days",
        limit: int = 5,
    ) -> List[TopNotaryReportType]:
        ctx: Context = info.context
        user = ctx.require_user()
        if user.role.value != "ADMIN":
            raise PermissionError("Admin only")
        start = self._report_start(date_range or "last30days")
        paid_statuses = [OrderStatus.PAID, OrderStatus.NOTARIZED, OrderStatus.SHIPPED, OrderStatus.DELIVERED]
        q = (
            select(
                Order.appointment_id,
                Notary.id.label("notary_id"),
                Notary.full_name,
                Notary.location,
                Notary.rating,
                func.count(Order.id).label("doc_count"),
                func.coalesce(func.sum(Order.total_amount), 0).label("revenue"),
            )
            .join(Notary, Notary.user_id == Order.user_id, isouter=True)
            .where(
                Order.deleted_at.is_(None),
                Order.status.in_(paid_statuses),
                Order.created_at >= start,
                Notary.id.isnot(None),
            )
            .group_by(Notary.id, Notary.full_name, Notary.location, Notary.rating, Order.appointment_id)
            .order_by(desc("revenue"))
            .limit(limit)
        )
        result = await ctx.session.execute(q)
        rows = result.fetchall()
        return [
            TopNotaryReportType(
                id=r.notary_id,
                name=r.full_name or "Unknown",
                location=r.location or "",
                documents=r.doc_count,
                revenue=round(r.revenue / 100, 2),
                rating=float(r.rating or 0),
            )
            for r in rows
        ]
