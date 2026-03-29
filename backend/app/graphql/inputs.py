"""Strawberry GraphQL input types."""
from __future__ import annotations
from typing import List
import strawberry


@strawberry.input
class LoginInput:
    method: str
    email: str | None = None
    phone: str | None = None
    password: str | None = None
    otp: str | None = None
    google_id_token: str | None = None


@strawberry.input
class SignupInput:
    name: str
    email: str
    phone: str
    password: str
    otp: str | None = None
    accept_terms: bool


@strawberry.input
class RefreshTokenInput:
    refresh_token: str


@strawberry.input
class CreateDocumentInput:
    template_id: str
    title: str | None = None
    form_data: strawberry.scalars.JSON
    current_step: int | None = None
    draft_id: str | None = None


@strawberry.input
class CheckoutInput:
    document_id: str
    delivery_address_id: str
    coupon_code: str | None = None


@strawberry.input
class CreateAppointmentInput:
    notary_id: str
    scheduled_date: str  # ISO date
    scheduled_time: str
    document_type: str | None = None
    notes: str | None = None


@strawberry.input
class CreateAddressInput:
    label: str | None = None
    line1: str
    line2: str | None = None
    city: str
    state: str
    pincode: str
    country: str
    is_default: bool | None = None


@strawberry.input
class UpdateAddressInput:
    address_id: str
    label: str | None = None
    line1: str | None = None
    line2: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    country: str | None = None
    is_default: bool | None = None


@strawberry.input
class ForgotPasswordInput:
    email: str | None = None
    phone: str | None = None


@strawberry.input
class ResetPasswordInput:
    token: str
    new_password: str


@strawberry.input
class ChangePasswordInput:
    current_password: str
    new_password: str


@strawberry.input
class DocumentsFilterInput:
    status: str | None = None
    category: str | None = None
    limit: int | None = None
    offset: int | None = None


@strawberry.input
class OrdersFilterInput:
    status: str | None = None
    type: str | None = None
    limit: int | None = None
    offset: int | None = None


@strawberry.input
class ReportsFilterInput:
    date_range: str | None = None
    start_date: str | None = None
    end_date: str | None = None


@strawberry.input
class NotaryApplicationInput:
    first_name: str
    middle_name: str | None = None
    last_name: str
    email: str
    phone: str
    license_number: str | None = None
    bar_council_number: str | None = None
    experience: str | None = None       # e.g. "5" or "5 years"
    specialization: str | None = None   # comma-separated
    location: str | None = None
    bar_council_file: str | None = None  # Upload placeholder; use base64 or URL in real impl


@strawberry.input
class TimeRangeInput:
    start: str
    end: str


@strawberry.input
class DayAvailabilityInput:
    day: str
    enabled: bool
    slots: List[TimeRangeInput]


@strawberry.input
class AvailabilityInput:
    days: List[DayAvailabilityInput]
    break_start: str | None = None
    break_end: str | None = None


@strawberry.input
class UpdateNotaryProfileInput:
    full_name: str | None = None
    phone: str | None = None
    alternate_phone: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    languages: str | None = None
    consultation_fee: int | None = None
    bio: str | None = None
    photo_url: str | None = None
    account_holder_name: str | None = None
    account_number: str | None = None
    ifsc_code: str | None = None
    bank_name: str | None = None
    branch_name: str | None = None


@strawberry.input
class ContactInput:
    name: str
    email: str
    phone: str | None = None
    subject: str
    message: str


@strawberry.input
class AdminUpdateUserStatusInput:
    user_id: str
    status: str  # ACTIVE | SUSPENDED | INACTIVE


@strawberry.input
class AdminSettingsInput:
    site_name: str | None = None
    site_url: str | None = None
    support_email: str | None = None
    support_phone: str | None = None
    address: str | None = None
    email_notifications: bool | None = None
    sms_notifications: bool | None = None
    razorpay_enabled: bool | None = None
    razorpay_key: str | None = None
    maintenance_mode: bool | None = None
