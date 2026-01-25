"""Helper to map ORM -> GraphQL types."""
from datetime import date, datetime
from app.models.user import User
from app.models.document import Document, DocumentTemplate
from app.models.order import Order, Payment, Delivery
from app.models.appointment import Appointment
from app.models.address import Address
from app.models.notary import Notary
from app.models.content import Service, FAQ, ContactSubmission, PricingPlan
from app.services.user import UserService
from app.graphql.types import (
    UserType,
    DocumentType,
    DocumentTemplateType,
    OrderGql,
    PaymentType,
    DeliveryType,
    AppointmentType,
    AddressType,
    NotaryType,
    ServiceType,
    FAQType,
    ContactSubmissionType,
    PricingPlanType,
    CheckoutSummaryType,
    DeliveryStageType,
    TemplateStepType,
)


def _parse_date(s: str | None) -> date | None:
    if not s:
        return None
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00")).date()
    except Exception:
        return None


def user_to_gql(u: User, permissions: list[str]) -> UserType:
    return UserType(
        id=u.id,
        email=u.email,
        phone=u.phone,
        name=u.name,
        role=u.role.value,
        status=u.status.value,
        email_verified=u.email_verified,
        phone_verified=u.phone_verified,
        permissions=permissions,
        created_at=u.created_at,
        updated_at=u.updated_at,
        deleted_at=u.deleted_at,
    )


def doc_to_gql(d: Document) -> DocumentType:
    return DocumentType(
        id=d.id,
        user_id=d.user_id,
        notary_id=d.notary_id,
        order_id=d.order_id,
        template_id=d.template_id,
        title=d.title,
        category=d.category.value,
        status=d.status.value,
        form_data=d.form_data,
        completion_percentage=d.completion_percentage,
        current_step=d.current_step,
        pdf_url=d.pdf_url,
        created_at=d.created_at,
        updated_at=d.updated_at,
        deleted_at=d.deleted_at,
    )


def template_to_gql(t: DocumentTemplate) -> DocumentTemplateType:
    steps = []
    for s in (t.steps or []):
        if isinstance(s, dict):
            steps.append(TemplateStepType(
                id=s.get("id", 0),
                title=s.get("title", ""),
                fields=s.get("fields", []),
            ))
        else:
            steps.append(TemplateStepType(id=s.id, title=s.title, fields=s.fields))
    return DocumentTemplateType(
        id=t.id,
        slug=t.slug,
        name=t.name,
        category=t.category.value,
        steps=steps,
        default_values=t.default_values or {},
        field_configs=t.field_configs or {},
        created_at=t.created_at,
        updated_at=t.updated_at,
        deleted_at=t.deleted_at,
    )


def order_to_gql(o: Order) -> OrderGql:
    return OrderGql(
        id=o.id,
        order_number=o.order_number,
        user_id=o.user_id,
        document_id=o.document_id,
        appointment_id=o.appointment_id,
        type=o.type.value,
        status=o.status.value,
        base_price=o.base_price,
        delivery_fee=o.delivery_fee,
        discount=o.discount,
        total_amount=o.total_amount,
        coupon_code=o.coupon_code,
        created_at=o.created_at,
        updated_at=o.updated_at,
        deleted_at=o.deleted_at,
    )


def payment_to_gql(p: Payment) -> PaymentType:
    return PaymentType(
        id=p.id,
        order_id=p.order_id,
        amount=p.amount,
        currency=p.currency,
        status=p.status.value,
        method=p.method.value,
        razorpay_order_id=p.razorpay_order_id,
        razorpay_payment_id=p.razorpay_payment_id,
        paid_at=p.paid_at,
        created_at=p.created_at,
        updated_at=p.updated_at,
        deleted_at=p.deleted_at,
    )


def delivery_to_gql(d: Delivery) -> DeliveryType:
    stages = [
        DeliveryStageType(
            name=s.get("name", ""),
            completed=s.get("completed", False),
            date=s.get("date"),
        )
        for s in (d.stages or [])
    ]
    return DeliveryType(
        id=d.id,
        order_id=d.order_id,
        document_name=d.document_name,
        status=d.status.value,
        courier_partner=d.courier_partner,
        tracking_number=d.tracking_number,
        current_location=d.current_location,
        expected_delivery=d.expected_delivery,
        stages=stages,
        created_at=d.created_at,
        updated_at=d.updated_at,
        deleted_at=d.deleted_at,
    )


def appointment_to_gql(a: Appointment) -> AppointmentType:
    return AppointmentType(
        id=a.id,
        user_id=a.user_id,
        notary_id=a.notary_id,
        document_type=a.document_type,
        scheduled_date=a.scheduled_date,
        scheduled_time=a.scheduled_time,
        status=a.status.value,
        amount=a.amount,
        meeting_link=a.meeting_link,
        notes=a.notes,
        order_id=a.order_id,
        created_at=a.created_at,
        updated_at=a.updated_at,
        deleted_at=a.deleted_at,
    )


def address_to_gql(a: Address) -> AddressType:
    return AddressType(
        id=a.id,
        user_id=a.user_id,
        label=a.label,
        line1=a.line1,
        line2=a.line2,
        city=a.city,
        state=a.state,
        pincode=a.pincode,
        country=a.country,
        is_default=a.is_default,
        created_at=a.created_at,
        updated_at=a.updated_at,
        deleted_at=a.deleted_at,
    )


def notary_to_gql(n: Notary) -> NotaryType:
    return NotaryType(
        id=n.id,
        user_id=n.user_id,
        full_name=n.full_name,
        email=n.email,
        phone=n.phone,
        photo_url=n.photo_url,
        license_number=n.license_number,
        bar_council_number=n.bar_council_number,
        bar_council_state=n.bar_council_state,
        enrollment_date=n.enrollment_date,
        experience=n.experience,
        specialization=n.specialization or [],
        languages=n.languages or [],
        location=n.location,
        consultation_fee=n.consultation_fee,
        rating=n.rating,
        reviews_count=n.reviews_count,
        completed_sessions=n.completed_sessions,
        bio=n.bio,
        is_verified=n.is_verified,
        verification_date=n.verification_date,
        created_at=n.created_at,
        updated_at=n.updated_at,
        deleted_at=n.deleted_at,
    )


def service_to_gql(s: Service) -> ServiceType:
    return ServiceType(
        id=s.id,
        name=s.name,
        description=s.description,
        price=s.price,
        base_price=s.base_price,
        delivery_fee=s.delivery_fee,
        flow=s.flow or [],
        features=s.features or [],
        includes=s.includes or [],
        popular=s.popular,
        created_at=s.created_at,
        updated_at=s.updated_at,
        deleted_at=s.deleted_at,
    )


def faq_to_gql(f: FAQ) -> FAQType:
    return FAQType(
        id=f.id,
        category=f.category.value,
        question=f.question,
        answer=f.answer,
        created_at=f.created_at,
        updated_at=f.updated_at,
        deleted_at=f.deleted_at,
    )


def pricing_plan_to_gql(p: PricingPlan) -> PricingPlanType:
    return PricingPlanType(
        id=p.id,
        name=p.name,
        price=p.price,
        amount=p.amount,
        period=p.period,
        features=p.features or [],
        popular=p.popular,
        cta=p.cta,
        created_at=p.created_at,
        updated_at=p.updated_at,
        deleted_at=p.deleted_at,
    )


def contact_to_gql(c: ContactSubmission) -> ContactSubmissionType:
    return ContactSubmissionType(
        id=c.id,
        name=c.name,
        email=c.email,
        phone=c.phone,
        subject=c.subject,
        message=c.message,
        created_at=c.created_at,
        updated_at=c.updated_at,
        deleted_at=c.deleted_at,
    )
