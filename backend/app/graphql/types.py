"""Strawberry GraphQL types."""
from datetime import date, datetime
from typing import Optional, List, Annotated
import strawberry
from strawberry.types import Info

from app.models.enums import (
    UserRole as UserRoleEnum,
    UserStatus as UserStatusEnum,
    DocumentStatus as DocumentStatusEnum,
    DocumentCategory as DocumentCategoryEnum,
    OrderType as OrderTypeEnum,
    OrderStatus as OrderStatusEnum,
    AppointmentStatus as AppointmentStatusEnum,
    PaymentStatus as PaymentStatusEnum,
    PaymentMethod as PaymentMethodEnum,
    FAQCategory as FAQCategoryEnum,
    LoginMethod as LoginMethodEnum,
)

# Re-export enums for GraphQL
UserRole = strawberry.enum(UserRoleEnum)
UserStatus = strawberry.enum(UserStatusEnum)
DocumentStatus = strawberry.enum(DocumentStatusEnum)
DocumentCategory = strawberry.enum(DocumentCategoryEnum)
OrderType = strawberry.enum(OrderTypeEnum)
OrderStatus = strawberry.enum(OrderStatusEnum)
AppointmentStatus = strawberry.enum(AppointmentStatusEnum)
PaymentStatus = strawberry.enum(PaymentStatusEnum)
PaymentMethod = strawberry.enum(PaymentMethodEnum)
FAQCategory = strawberry.enum(FAQCategoryEnum)
LoginMethod = strawberry.enum(LoginMethodEnum)


@strawberry.type
class TemplateStepType:
    id: int
    title: str
    fields: List[str]


@strawberry.type
class DocumentTemplateType:
    id: str
    slug: str
    name: str
    category: str
    steps: List[TemplateStepType]
    default_values: strawberry.scalars.JSON
    field_configs: strawberry.scalars.JSON
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


@strawberry.type
class AddressType:
    id: str
    user_id: str
    label: Optional[str] = None
    line1: str
    line2: Optional[str] = None
    city: str
    state: str
    pincode: str
    country: str
    is_default: bool
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


@strawberry.type
class UserType:
    id: str
    email: str
    phone: Optional[str] = None
    name: str
    role: str
    status: str
    email_verified: bool
    phone_verified: bool
    permissions: List[str]
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


@strawberry.type
class NotaryType:
    id: str
    user_id: str
    full_name: str
    email: str
    phone: str
    photo_url: Optional[str] = None
    license_number: str
    bar_council_number: str
    bar_council_state: str
    enrollment_date: date
    experience: int
    specialization: List[str]
    languages: List[str]
    location: str
    consultation_fee: int
    rating: float
    reviews_count: int
    completed_sessions: int
    bio: Optional[str] = None
    is_verified: bool
    verification_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


@strawberry.type
class DocumentType:
    id: str
    user_id: str
    notary_id: Optional[str] = None
    order_id: Optional[str] = None
    template_id: str
    title: str
    category: str
    status: str
    form_data: strawberry.scalars.JSON
    completion_percentage: Optional[int] = None
    current_step: Optional[int] = None
    pdf_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


@strawberry.type
class PaymentType:
    id: str
    order_id: str
    amount: int
    currency: str
    status: str
    method: str
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    paid_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


@strawberry.type
class DeliveryStageType:
    name: str
    completed: bool
    date: Optional[datetime] = None


@strawberry.type
class DeliveryType:
    id: str
    order_id: str
    document_name: str
    status: str
    courier_partner: str
    tracking_number: str
    current_location: Optional[str] = None
    expected_delivery: Optional[date] = None
    stages: List[DeliveryStageType]
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


@strawberry.type
class OrderGql:
    id: str
    order_number: str
    user_id: str
    document_id: Optional[str] = None
    appointment_id: Optional[str] = None
    type: str
    status: str
    base_price: int
    delivery_fee: Optional[int] = None
    discount: Optional[int] = None
    total_amount: int
    coupon_code: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


@strawberry.type
class AppointmentType:
    id: str
    user_id: str
    notary_id: str
    document_type: Optional[str] = None
    scheduled_date: date
    scheduled_time: str
    status: str
    amount: int
    meeting_link: Optional[str] = None
    notes: Optional[str] = None
    order_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


@strawberry.type
class CheckoutSummaryType:
    base_price: int
    delivery_fee: int
    subtotal: int
    discount: int
    total: int
    coupon_applied: bool


@strawberry.type
class AuthPayloadType:
    access_token: str
    refresh_token: str
    expires_in: int
    user: UserType


@strawberry.type
class OTPResponseType:
    success: bool
    message: str
    expires_in: Optional[int] = None


@strawberry.type
class ForgotPasswordResponseType:
    success: bool
    message: str


@strawberry.type
class PageInfoType:
    has_next_page: bool
    has_previous_page: bool
    total_count: int


@strawberry.type
class DocumentConnectionType:
    nodes: List[DocumentType]
    page_info: PageInfoType


@strawberry.type
class OrderConnectionType:
    nodes: List[OrderGql]
    page_info: PageInfoType


@strawberry.type
class TimeSlotType:
    date: date
    slots: List[str]


@strawberry.type
class ServiceType:
    id: str
    name: str
    description: str
    price: str
    base_price: Optional[int] = None
    delivery_fee: Optional[int] = None
    flow: List[str]
    features: List[str]
    includes: List[str]
    popular: bool
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


@strawberry.type
class FAQType:
    id: str
    category: str
    question: str
    answer: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


@strawberry.type
class PricingPlanType:
    id: str
    name: str
    price: str
    amount: int
    period: Optional[str] = None
    features: List[str]
    popular: bool
    cta: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


@strawberry.type
class ContactSubmissionType:
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    subject: str
    message: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


@strawberry.type
class NotaryApplicationType:
    id: str
    application_number: str
    user_id: Optional[str] = None
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    email: str
    phone: str
    license_number: Optional[str] = None
    bar_council_number: Optional[str] = None
    experience: Optional[str] = None
    specialization: Optional[str] = None
    location: Optional[str] = None
    status: str
    applied_at: datetime
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


@strawberry.type
class AdminStatsType:
    total_users: int
    total_documents: int
    active_notaries: int
    pending_applications: int
    revenue_month: float
    pending_orders: int
    active_sessions: int
    support_tickets: int


@strawberry.type
class ReportRevenueByTypeType:
    type: str
    amount: float
    count: int
    percentage: int


@strawberry.type
class TransactionType:
    id: str
    document: str
    client: str
    amount: int
    date: date
    time: Optional[str] = None
    status: str


@strawberry.type
class NotaryAvailabilityType:
    days: strawberry.scalars.JSON
    break_start: Optional[str] = None
    break_end: Optional[str] = None


@strawberry.type
class ReviewType:
    id: str
    user_id: str
    notary_id: str
    session_id: Optional[str] = None
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
