"""GraphQL mutations."""
from datetime import date, datetime, timezone
from typing import Optional, List

import strawberry
from sqlalchemy import select

from app.graphql.context import Context
from app.graphql.types import (
    UserType,
    DocumentType,
    OrderGql,
    PaymentType,
    PaymentInitType,
    AppointmentType,
    AddressType,
    CheckoutSummaryType,
    AuthPayloadType,
    OTPResponseType,
    ForgotPasswordResponseType,
    NotaryApplicationType,
    NotaryType,
    ContactSubmissionType,
    NotaryAvailabilityType,
    ReviewType,
    KycResultType,
)
from app.graphql.inputs import (
    LoginInput,
    SignupInput,
    RefreshTokenInput,
    CreateDocumentInput,
    CheckoutInput,
    CreateAppointmentInput,
    CreateAddressInput,
    UpdateAddressInput,
    ForgotPasswordInput,
    ResetPasswordInput,
    ChangePasswordInput,
    NotaryApplicationInput,
    AvailabilityInput,
    UpdateNotaryProfileInput,
    ContactInput,
    AdminSettingsInput,
    AdminUpdateUserStatusInput,
    SubmitKycInput,
)
from app.graphql.resolvers.helpers import (
    user_to_gql,
    doc_to_gql,
    order_to_gql,
    payment_to_gql,
    appointment_to_gql,
    address_to_gql,
    notary_to_gql,
    contact_to_gql,
)
from app.services.auth import AuthService
from app.services.user import UserService
from app.services.document import DocumentService
from app.services import email as email_svc
from app.services.order import OrderService
from app.repositories.address import AddressRepository
from app.repositories.appointment import AppointmentRepository
from app.models.address import Address
from app.models.appointment import Appointment
from app.models.order import Order
from app.models.notary import NotaryApplication, Notary
from app.models.enums import AppointmentStatus, NotaryApplicationStatus, UserStatus, UserRole
from app.models.user import User
import uuid
import random
import string


def _app_number() -> str:
    return "NOT-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=10))


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def signup(self, info: strawberry.types.Info, input: SignupInput) -> AuthPayloadType:
        ctx: Context = info.context
        svc = AuthService(ctx.session)
        user, access, refresh, expires = await svc.signup(
            name=input.name,
            email=input.email,
            phone=input.phone,
            password=input.password,
            accept_terms=input.accept_terms,
        )
        # OTP was verified before reaching this step — mark user as active
        user.email_verified = True
        user.phone_verified = bool(user.phone)
        user.status = UserStatus.ACTIVE
        await ctx.session.flush()
        await ctx.session.refresh(user)
        usvc = UserService(ctx.session)
        perms = usvc.permissions_for_user(user)
        return AuthPayloadType(
            access_token=access,
            refresh_token=refresh,
            expires_in=expires,
            user=user_to_gql(user, perms),
        )

    @strawberry.mutation
    async def login(self, info: strawberry.types.Info, input: LoginInput) -> Optional[AuthPayloadType]:
        ctx: Context = info.context
        svc = AuthService(ctx.session)
        if input.method == "EMAIL" and input.email and input.password:
            out = await svc.login_email_password(input.email, input.password)
        elif input.method == "PHONE" and input.phone and input.password:
            out = await svc.login_phone_password(input.phone, input.password)
        else:
            return None
        if not out:
            return None
        user, access, refresh, expires = out
        usvc = UserService(ctx.session)
        perms = usvc.permissions_for_user(user)
        return AuthPayloadType(
            access_token=access,
            refresh_token=refresh,
            expires_in=expires,
            user=user_to_gql(user, perms),
        )

    @strawberry.mutation
    async def refresh_token(self, info: strawberry.types.Info, input: RefreshTokenInput) -> Optional[AuthPayloadType]:
        ctx: Context = info.context
        svc = AuthService(ctx.session)
        out = await svc.refresh_tokens(input.refresh_token)
        if not out:
            return None
        user, access, refresh, expires = out
        usvc = UserService(ctx.session)
        perms = usvc.permissions_for_user(user)
        return AuthPayloadType(
            access_token=access,
            refresh_token=refresh,
            expires_in=expires,
            user=user_to_gql(user, perms),
        )

    @strawberry.mutation
    async def logout(self, info: strawberry.types.Info) -> bool:
        ctx: Context = info.context
        user = ctx.require_user()
        svc = AuthService(ctx.session)
        await svc.logout(user.id)
        return True

    @strawberry.mutation
    async def create_document(
        self,
        info: strawberry.types.Info,
        input: CreateDocumentInput,
    ) -> DocumentType:
        ctx: Context = info.context
        user = ctx.require_user()
        svc = DocumentService(ctx.session)
        template = await svc.get_template_by_slug(input.template_id)
        tid = template.id if template else input.template_id
        doc = await svc.create_draft(
            user_id=user.id,
            template_id=tid,
            form_data=input.form_data,
            title=input.title,
            current_step=input.current_step,
            draft_id=input.draft_id,
            notary_id=input.notary_id,
        )
        return doc_to_gql(doc)

    @strawberry.mutation
    async def save_draft(self, info: strawberry.types.Info, document_id: str) -> DocumentType:
        ctx: Context = info.context
        user = ctx.require_user()
        svc = DocumentService(ctx.session)
        from app.repositories.document import DocumentRepository
        repo = DocumentRepository(ctx.session)
        d = await repo.get(document_id)
        if not d or d.user_id != user.id:
            raise ValueError("Document not found")
        return doc_to_gql(d)

    @strawberry.mutation
    async def delete_draft(self, info: strawberry.types.Info, document_id: str) -> bool:
        ctx: Context = info.context
        user = ctx.require_user()
        from app.repositories.document import DocumentRepository
        from app.models.enums import DocumentStatus
        repo = DocumentRepository(ctx.session)
        d = await repo.get(document_id)
        if not d or d.user_id != user.id or d.status != DocumentStatus.DRAFT:
            raise ValueError("Document not found or not draft")
        await repo.delete_soft(d)
        return True

    @strawberry.mutation
    async def create_order(
        self,
        info: strawberry.types.Info,
        input: CheckoutInput,
    ) -> OrderGql:
        ctx: Context = info.context
        user = ctx.require_user()
        svc = OrderService(ctx.session)
        order = await svc.create_from_checkout(
            user_id=user.id,
            document_id=input.document_id,
            delivery_address_id=input.delivery_address_id,
            coupon_code=input.coupon_code,
        )
        return order_to_gql(order)

    @strawberry.mutation
    async def apply_coupon(
        self,
        info: strawberry.types.Info,
        document_id: str,
        code: str,
    ) -> CheckoutSummaryType:
        ctx: Context = info.context
        user = ctx.require_user()
        svc = DocumentService(ctx.session)
        s = await svc.get_checkout_summary(document_id, user.id, code)
        return CheckoutSummaryType(
            base_price=s["base_price"],
            delivery_fee=s["delivery_fee"],
            subtotal=s["subtotal"],
            discount=s["discount"],
            total=s["total"],
            coupon_applied=s["coupon_applied"],
        )

    @strawberry.mutation
    async def create_payment(self, info: strawberry.types.Info, order_id: str) -> PaymentType:
        ctx: Context = info.context
        user = ctx.require_user()
        svc = OrderService(ctx.session)
        pay = await svc.create_payment_intent(order_id, user.id)
        return payment_to_gql(pay)

    @strawberry.mutation
    async def initiate_payment(
        self,
        info: strawberry.types.Info,
        document_id: str,
        coupon_code: Optional[str] = None,
        delivery_address_id: Optional[str] = None,
    ) -> PaymentInitType:
        """Create order + Razorpay payment order in one step. Returns everything the frontend needs to open the Razorpay modal."""
        ctx: Context = info.context
        user = ctx.require_user()
        from app.core.config import get_settings
        from app.repositories.document import DocumentRepository
        from app.models.enums import OrderStatus

        svc = OrderService(ctx.session)
        doc_repo = DocumentRepository(ctx.session)

        doc = await doc_repo.get(document_id)
        if not doc or doc.user_id != user.id:
            raise ValueError("Document not found")

        # Reuse existing pending order for this document if one exists
        existing_order = await ctx.session.execute(
            select(Order).where(
                Order.document_id == document_id,
                Order.user_id == user.id,
                Order.status == OrderStatus.PENDING,
                Order.deleted_at.is_(None),
            )
        )
        order = existing_order.scalar_one_or_none()
        if not order:
            order = await svc.create_from_checkout(
                user_id=user.id,
                document_id=document_id,
                delivery_address_id=delivery_address_id,
                coupon_code=coupon_code,
            )

        pay = await svc.create_payment_intent(order.id, user.id)

        settings = get_settings()
        is_test = not bool(settings.razorpay_key_id and settings.razorpay_key_secret)

        return PaymentInitType(
            payment_id=pay.id,
            order_id=order.id,
            order_number=order.order_number,
            razorpay_order_id=pay.razorpay_order_id or '',
            razorpay_key_id=settings.razorpay_key_id,
            amount=order.total_amount * 100,  # paise
            currency=pay.currency,
            document_title=doc.title,
            is_test_mode=is_test,
        )

    @strawberry.mutation
    async def create_appointment(
        self,
        info: strawberry.types.Info,
        input: CreateAppointmentInput,
    ) -> AppointmentType:
        ctx: Context = info.context
        user = ctx.require_user()
        from app.models.notary import Notary
        from sqlalchemy import select
        n = await ctx.session.execute(select(Notary).where(Notary.id == input.notary_id, Notary.deleted_at.is_(None)))
        notary = n.scalar_one_or_none()
        if not notary:
            raise ValueError("Notary not found")
        dt = date.fromisoformat(input.scheduled_date)
        apt = Appointment(
            user_id=user.id,
            notary_id=input.notary_id,
            document_type=input.document_type,
            scheduled_date=dt,
            scheduled_time=input.scheduled_time,
            status=AppointmentStatus.PENDING,
            amount=notary.consultation_fee,
            notes=input.notes,
        )
        ctx.session.add(apt)
        await ctx.session.flush()
        await ctx.session.refresh(apt)
        return appointment_to_gql(apt)

    @strawberry.mutation
    async def create_address(
        self,
        info: strawberry.types.Info,
        input: CreateAddressInput,
    ) -> AddressType:
        ctx: Context = info.context
        user = ctx.require_user()
        addr = Address(
            user_id=user.id,
            label=input.label,
            line1=input.line1,
            line2=input.line2,
            city=input.city,
            state=input.state,
            pincode=input.pincode,
            country=input.country,
            is_default=input.is_default or False,
        )
        ctx.session.add(addr)
        await ctx.session.flush()
        await ctx.session.refresh(addr)
        return address_to_gql(addr)

    @strawberry.mutation
    async def update_address(
        self,
        info: strawberry.types.Info,
        input: UpdateAddressInput,
    ) -> AddressType:
        ctx: Context = info.context
        user = ctx.require_user()
        repo = AddressRepository(ctx.session)
        a = await repo.get(input.address_id)
        if not a or a.user_id != user.id:
            raise ValueError("Address not found")
        if input.label is not None:
            a.label = input.label
        if input.line1 is not None:
            a.line1 = input.line1
        if input.line2 is not None:
            a.line2 = input.line2
        if input.city is not None:
            a.city = input.city
        if input.state is not None:
            a.state = input.state
        if input.pincode is not None:
            a.pincode = input.pincode
        if input.country is not None:
            a.country = input.country
        if input.is_default is not None:
            a.is_default = input.is_default
        await ctx.session.flush()
        await ctx.session.refresh(a)
        return address_to_gql(a)

    @strawberry.mutation
    async def delete_address(self, info: strawberry.types.Info, address_id: str) -> bool:
        ctx: Context = info.context
        user = ctx.require_user()
        repo = AddressRepository(ctx.session)
        a = await repo.get(address_id)
        if not a or a.user_id != user.id:
            raise ValueError("Address not found")
        await repo.delete_soft(a)
        return True

    @strawberry.mutation
    async def send_otp(
        self,
        info: strawberry.types.Info,
        email: Optional[str] = None,
        phone: Optional[str] = None,
    ) -> OTPResponseType:
        from app.services.otp import generate_and_send
        success, message = await generate_and_send(email=email, phone=phone)
        return OTPResponseType(
            success=success,
            message=message,
            expires_in=300 if success else None,
        )

    @strawberry.mutation
    async def verify_otp(
        self,
        info: strawberry.types.Info,
        contact: str,
        code: str,
    ) -> OTPResponseType:
        from app.services.otp import verify_otp as _verify
        ok = await _verify(contact, code)
        return OTPResponseType(
            success=ok,
            message="OTP verified successfully." if ok else "Invalid or expired OTP.",
            expires_in=None,
        )

    @strawberry.mutation
    async def forgot_password(
        self,
        info: strawberry.types.Info,
        input: ForgotPasswordInput,
    ) -> ForgotPasswordResponseType:
        return ForgotPasswordResponseType(
            success=True,
            message="If an account exists, you will receive reset instructions.",
        )

    @strawberry.mutation
    async def reset_password(
        self,
        info: strawberry.types.Info,
        input: ResetPasswordInput,
    ) -> bool:
        return True

    @strawberry.mutation
    async def change_password(
        self,
        info: strawberry.types.Info,
        input: ChangePasswordInput,
    ) -> bool:
        ctx: Context = info.context
        user = ctx.require_user()
        from app.core.security import verify_password, hash_password
        if not user.hashed_password or not verify_password(input.current_password, user.hashed_password):
            raise ValueError("Current password invalid")
        user.hashed_password = hash_password(input.new_password)
        await ctx.session.flush()
        return True

    @strawberry.mutation
    async def submit_notary_application(
        self,
        info: strawberry.types.Info,
        input: NotaryApplicationInput,
    ) -> NotaryApplicationType:
        ctx: Context = info.context
        docs: dict = {}
        if input.bar_council_file:
            docs["bar_council_file"] = input.bar_council_file
        app = NotaryApplication(
            application_number=_app_number(),
            user_id=ctx.user.id if ctx.user else None,
            first_name=input.first_name,
            middle_name=input.middle_name,
            last_name=input.last_name,
            email=input.email,
            phone=input.phone,
            license_number=input.license_number,
            bar_council_number=input.bar_council_number,
            experience=input.experience,
            specialization=input.specialization,
            location=input.location,
            documents=docs,
            status=NotaryApplicationStatus.PENDING,
        )
        ctx.session.add(app)
        await ctx.session.flush()
        await ctx.session.refresh(app)
        import asyncio
        full_name = " ".join(p for p in [input.first_name, input.middle_name, input.last_name] if p)
        asyncio.create_task(email_svc.send_notary_application_received(input.email, full_name, app.application_number))
        return NotaryApplicationType(
            id=app.id,
            application_number=app.application_number,
            user_id=app.user_id,
            first_name=app.first_name,
            middle_name=app.middle_name,
            last_name=app.last_name,
            email=app.email,
            phone=app.phone,
            license_number=app.license_number,
            bar_council_number=app.bar_council_number,
            experience=app.experience,
            specialization=app.specialization,
            location=app.location,
            status=app.status.value,
            applied_at=app.applied_at,
            reviewed_at=app.reviewed_at,
            created_at=app.created_at,
            updated_at=app.updated_at,
            deleted_at=app.deleted_at,
        )

    @strawberry.mutation
    async def confirm_payment(
        self,
        info: strawberry.types.Info,
        order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: Optional[str] = None,
    ) -> PaymentType:
        ctx: Context = info.context
        user = ctx.require_user()
        from app.models.order import Payment
        from app.models.enums import OrderStatus, PaymentStatus as PS
        from app.core.config import get_settings

        o = await ctx.session.get(Order, order_id)
        if not o or o.user_id != user.id:
            raise ValueError("Order not found")
        r = await ctx.session.execute(select(Payment).where(Payment.order_id == order_id))
        pay = r.scalar_one_or_none()
        if not pay:
            raise ValueError("Payment not found")

        # Verify Razorpay signature when keys are configured
        settings = get_settings()
        if settings.razorpay_key_secret and razorpay_signature and pay.razorpay_order_id:
            import hmac as hmac_mod
            import hashlib
            msg = f"{pay.razorpay_order_id}|{razorpay_payment_id}"
            expected = hmac_mod.new(
                settings.razorpay_key_secret.encode(),
                msg.encode(),
                hashlib.sha256,
            ).hexdigest()
            if not hmac_mod.compare_digest(expected, razorpay_signature):
                raise ValueError("Payment signature verification failed")

        pay.razorpay_payment_id = razorpay_payment_id
        pay.status = PS.COMPLETED
        pay.paid_at = datetime.now(timezone.utc)
        o.status = OrderStatus.PAID
        await ctx.session.flush()
        await ctx.session.refresh(pay)
        return payment_to_gql(pay)

    @strawberry.mutation
    async def accept_appointment(self, info: strawberry.types.Info, appointment_id: str) -> AppointmentType:
        ctx: Context = info.context
        user = ctx.require_user()
        from app.models.notary import Notary
        nr = await ctx.session.execute(select(Notary).where(Notary.user_id == user.id))
        notary = nr.scalar_one_or_none()
        if not notary:
            raise ValueError("Notary profile not found")
        r = await ctx.session.execute(
            select(Appointment).where(Appointment.id == appointment_id, Appointment.deleted_at.is_(None))
        )
        apt = r.scalar_one_or_none()
        if not apt or apt.notary_id != notary.id:
            raise ValueError("Appointment not found")
        apt.status = AppointmentStatus.CONFIRMED
        # Generate a unique meeting link for this session
        if not apt.meeting_link:
            apt.meeting_link = f"https://meet.legaldoji.com/session/{uuid.uuid4().hex[:12]}"
        await ctx.session.flush()
        await ctx.session.refresh(apt)
        return appointment_to_gql(apt)

    @strawberry.mutation
    async def reject_appointment(
        self,
        info: strawberry.types.Info,
        appointment_id: str,
        reason: Optional[str] = None,
    ) -> AppointmentType:
        ctx: Context = info.context
        user = ctx.require_user()
        from app.models.notary import Notary
        nr = await ctx.session.execute(select(Notary).where(Notary.user_id == user.id))
        notary = nr.scalar_one_or_none()
        if not notary:
            raise ValueError("Notary profile not found")
        r = await ctx.session.execute(
            select(Appointment).where(Appointment.id == appointment_id, Appointment.deleted_at.is_(None))
        )
        apt = r.scalar_one_or_none()
        if not apt or apt.notary_id != notary.id:
            raise ValueError("Appointment not found")
        apt.status = AppointmentStatus.CANCELLED
        if reason:
            apt.notes = (apt.notes or "") + f"\nRejected: {reason}"
        await ctx.session.flush()
        await ctx.session.refresh(apt)
        return appointment_to_gql(apt)

    @strawberry.mutation
    async def complete_appointment(self, info: strawberry.types.Info, appointment_id: str) -> AppointmentType:
        """Notary marks a CONFIRMED appointment as COMPLETED and bumps their session counter."""
        ctx: Context = info.context
        user = ctx.require_user()
        nr = await ctx.session.execute(select(Notary).where(Notary.user_id == user.id))
        notary = nr.scalar_one_or_none()
        if not notary:
            raise ValueError("Notary profile not found")
        r = await ctx.session.execute(
            select(Appointment).where(Appointment.id == appointment_id, Appointment.deleted_at.is_(None))
        )
        apt = r.scalar_one_or_none()
        if not apt or apt.notary_id != notary.id:
            raise ValueError("Appointment not found")
        if apt.status != AppointmentStatus.CONFIRMED:
            raise ValueError("Only CONFIRMED appointments can be marked complete")
        apt.status = AppointmentStatus.COMPLETED
        notary.completed_sessions = (notary.completed_sessions or 0) + 1
        await ctx.session.flush()
        await ctx.session.refresh(apt)
        return appointment_to_gql(apt)

    @strawberry.mutation
    async def cancel_appointment(self, info: strawberry.types.Info, appointment_id: str) -> AppointmentType:
        ctx: Context = info.context
        user = ctx.require_user()
        r = await ctx.session.execute(
            select(Appointment).where(Appointment.id == appointment_id, Appointment.deleted_at.is_(None))
        )
        apt = r.scalar_one_or_none()
        if not apt or apt.user_id != user.id:
            raise ValueError("Appointment not found")
        apt.status = AppointmentStatus.CANCELLED
        await ctx.session.flush()
        await ctx.session.refresh(apt)
        return appointment_to_gql(apt)

    @strawberry.mutation
    async def update_notary_availability(
        self,
        info: strawberry.types.Info,
        input: AvailabilityInput,
    ) -> NotaryAvailabilityType:
        ctx: Context = info.context
        user = ctx.require_user()
        from app.models.notary import NotaryAvailability
        from app.models.notary import Notary
        r = await ctx.session.execute(select(Notary).where(Notary.user_id == user.id))
        n = r.scalar_one_or_none()
        if not n:
            raise ValueError("Notary profile not found")
        days = [{"day": d.day, "enabled": d.enabled, "slots": [{"start": s.start, "end": s.end} for s in d.slots]} for d in input.days]
        r2 = await ctx.session.execute(
            select(NotaryAvailability).where(NotaryAvailability.notary_id == n.id)
        )
        avail = r2.scalar_one_or_none()
        if not avail:
            avail = NotaryAvailability(notary_id=n.id, days=days, break_start=input.break_start, break_end=input.break_end)
            ctx.session.add(avail)
        else:
            avail.days = days
            avail.break_start = input.break_start
            avail.break_end = input.break_end
        await ctx.session.flush()
        await ctx.session.refresh(avail)
        return NotaryAvailabilityType(days=avail.days, break_start=avail.break_start, break_end=avail.break_end)

    @strawberry.mutation
    async def update_notary_profile(
        self,
        info: strawberry.types.Info,
        input: UpdateNotaryProfileInput,
    ) -> NotaryType:
        ctx: Context = info.context
        user = ctx.require_user()
        from app.models.notary import Notary
        r = await ctx.session.execute(select(Notary).where(Notary.user_id == user.id))
        n = r.scalar_one_or_none()
        if not n:
            raise ValueError("Notary profile not found")
        if input.full_name is not None:
            n.full_name = input.full_name
        if input.phone is not None:
            n.phone = input.phone
        if input.consultation_fee is not None:
            n.consultation_fee = input.consultation_fee
        if input.bio is not None:
            n.bio = input.bio
        if input.photo_url is not None:
            n.photo_url = input.photo_url
        if input.languages is not None:
            n.languages = [lang.strip() for lang in input.languages.split(',') if lang.strip()]
        if input.address is not None or input.city is not None or input.state is not None:
            parts = [p for p in [input.address, input.city, input.state] if p]
            if parts:
                n.location = ', '.join(parts)
        if input.account_holder_name is not None:
            n.bank_account_holder = input.account_holder_name
        if input.account_number is not None:
            n.bank_account_number = input.account_number
        if input.ifsc_code is not None:
            n.bank_ifsc = input.ifsc_code
        if input.bank_name is not None:
            n.bank_name = input.bank_name
        if input.branch_name is not None:
            n.bank_branch = input.branch_name
        await ctx.session.flush()
        await ctx.session.refresh(n)
        return notary_to_gql(n)

    @strawberry.mutation
    async def submit_contact(self, info: strawberry.types.Info, input: ContactInput) -> ContactSubmissionType:
        ctx: Context = info.context
        from app.models.content import ContactSubmission
        c = ContactSubmission(
            name=input.name,
            email=input.email,
            phone=input.phone,
            subject=input.subject,
            message=input.message,
        )
        ctx.session.add(c)
        await ctx.session.flush()
        await ctx.session.refresh(c)
        return contact_to_gql(c)

    @strawberry.mutation
    async def create_review(
        self,
        info: strawberry.types.Info,
        notary_id: str,
        session_id: Optional[str] = None,
        rating: int = 5,
        comment: Optional[str] = None,
    ) -> ReviewType:
        ctx: Context = info.context
        user = ctx.require_user()
        from app.models.content import Review
        r = Review(user_id=user.id, notary_id=notary_id, session_id=session_id, rating=rating, comment=comment)
        ctx.session.add(r)
        await ctx.session.flush()
        await ctx.session.refresh(r)
        return ReviewType(
            id=r.id,
            user_id=r.user_id,
            notary_id=r.notary_id,
            session_id=r.session_id,
            rating=r.rating,
            comment=r.comment,
            created_at=r.created_at,
            updated_at=r.updated_at,
            deleted_at=r.deleted_at,
        )

    @strawberry.mutation
    async def approve_notary_application(
        self,
        info: strawberry.types.Info,
        application_id: str,
    ) -> NotaryApplicationType:
        ctx: Context = info.context
        user = ctx.require_user()
        if user.role.value != "ADMIN":
            raise PermissionError("Admin only")
        r = await ctx.session.execute(
            select(NotaryApplication).where(NotaryApplication.id == application_id)
        )
        app = r.scalar_one_or_none()
        if not app:
            raise ValueError("Application not found")
        app.status = NotaryApplicationStatus.APPROVED
        app.reviewed_at = datetime.now(timezone.utc)

        # Find the applicant user (by user_id or email fallback)
        applicant: User | None = None
        if app.user_id:
            applicant = await ctx.session.get(User, app.user_id)
        if not applicant:
            ur = await ctx.session.execute(select(User).where(User.email == app.email))
            applicant = ur.scalar_one_or_none()

        import asyncio
        import secrets
        from app.core.security import hash_password as _hash_pw
        from app.models.enums import KycStatus

        name_parts = [p for p in [app.first_name, app.middle_name, app.last_name] if p]
        full_name = " ".join(name_parts)
        temp_password: str | None = None

        if not applicant:
            # No account exists — create one with a temporary password
            temp_password = secrets.token_urlsafe(10)
            applicant = User(
                name=full_name,
                email=app.email,
                phone=app.phone,
                hashed_password=_hash_pw(temp_password),
                role=UserRole.NOTARY,
                status=UserStatus.ACTIVE,
                email_verified=True,
                phone_verified=bool(app.phone),
                kyc_status=KycStatus.NOT_SUBMITTED,
            )
            ctx.session.add(applicant)
            await ctx.session.flush()
            await ctx.session.refresh(applicant)
            app.user_id = applicant.id
        else:
            # Promote existing user role to NOTARY
            applicant.role = UserRole.NOTARY
            applicant.status = UserStatus.ACTIVE

        # Create Notary record only if one doesn't exist yet
        existing = await ctx.session.execute(
            select(Notary).where(Notary.user_id == applicant.id)
        )
        if not existing.scalar_one_or_none():
            exp_raw = app.experience or "0"
            try:
                exp_years = int("".join(c for c in exp_raw if c.isdigit()) or "0")
            except Exception:
                exp_years = 0
            spec_list: list[str] = []
            if app.specialization:
                spec_list = [s.strip() for s in app.specialization.split(",") if s.strip()]
            notary = Notary(
                user_id=applicant.id,
                full_name=full_name,
                email=app.email,
                phone=app.phone,
                license_number=app.license_number or "",
                bar_council_number=app.bar_council_number or "",
                bar_council_state="",
                enrollment_date=date.today(),
                experience=exp_years,
                specialization=spec_list,
                languages=[],
                location=app.location or "",
                consultation_fee=999,
                is_verified=True,
                verification_date=datetime.now(timezone.utc),
            )
            ctx.session.add(notary)

        await ctx.session.flush()
        await ctx.session.refresh(app)
        asyncio.create_task(email_svc.send_notary_approved(app.email, full_name, temp_password))
        return NotaryApplicationType(
            id=app.id,
            application_number=app.application_number,
            user_id=app.user_id,
            first_name=app.first_name,
            middle_name=app.middle_name,
            last_name=app.last_name,
            email=app.email,
            phone=app.phone,
            license_number=app.license_number,
            bar_council_number=app.bar_council_number,
            experience=app.experience,
            specialization=app.specialization,
            location=app.location,
            status=app.status.value,
            applied_at=app.applied_at,
            reviewed_at=app.reviewed_at,
            created_at=app.created_at,
            updated_at=app.updated_at,
            deleted_at=app.deleted_at,
        )

    @strawberry.mutation
    async def reject_notary_application(
        self,
        info: strawberry.types.Info,
        application_id: str,
        reason: Optional[str] = None,
    ) -> NotaryApplicationType:
        ctx: Context = info.context
        user = ctx.require_user()
        if user.role.value != "ADMIN":
            raise PermissionError("Admin only")
        r = await ctx.session.execute(
            select(NotaryApplication).where(NotaryApplication.id == application_id)
        )
        app = r.scalar_one_or_none()
        if not app:
            raise ValueError("Application not found")
        app.status = NotaryApplicationStatus.REJECTED
        app.reviewed_at = datetime.now(timezone.utc)
        if reason:
            app.documents = {**(app.documents or {}), "reject_reason": reason}
        await ctx.session.flush()
        await ctx.session.refresh(app)
        import asyncio
        full_name = " ".join(p for p in [app.first_name, app.middle_name, app.last_name] if p)
        asyncio.create_task(email_svc.send_notary_rejected(app.email, full_name, reason))
        return NotaryApplicationType(
            id=app.id,
            application_number=app.application_number,
            user_id=app.user_id,
            first_name=app.first_name,
            middle_name=app.middle_name,
            last_name=app.last_name,
            email=app.email,
            phone=app.phone,
            license_number=app.license_number,
            bar_council_number=app.bar_council_number,
            experience=app.experience,
            specialization=app.specialization,
            location=app.location,
            status=app.status.value,
            applied_at=app.applied_at,
            reviewed_at=app.reviewed_at,
            created_at=app.created_at,
            updated_at=app.updated_at,
            deleted_at=app.deleted_at,
        )

    @strawberry.mutation
    async def request_payout(
        self,
        info: strawberry.types.Info,
        amount: int,
    ) -> bool:
        """Notary submits a payout withdrawal request. Records the request timestamp on the notary record."""
        ctx: Context = info.context
        user = ctx.require_user()
        nr = await ctx.session.execute(select(Notary).where(Notary.user_id == user.id))
        notary = nr.scalar_one_or_none()
        if not notary:
            raise ValueError("Notary profile not found")
        if not notary.bank_account_number or not notary.bank_ifsc:
            raise ValueError("Bank details not set. Please update your profile first.")
        if amount < 500:
            raise ValueError("Minimum payout amount is ₹500")
        from datetime import datetime, timezone
        notary.pending_payout_amount = amount
        notary.payout_requested_at = datetime.now(timezone.utc)
        await ctx.session.flush()
        return True

    @strawberry.mutation
    async def update_admin_settings(
        self,
        info: strawberry.types.Info,
        input: AdminSettingsInput,
    ) -> strawberry.scalars.JSON:
        ctx: Context = info.context
        user = ctx.require_user()
        if user.role.value != "ADMIN":
            raise PermissionError("Admin only")
        from app.models.admin import AdminSettings
        r = await ctx.session.execute(select(AdminSettings).where(AdminSettings.key == "main"))
        row = r.scalar_one_or_none()
        data = (row.value if row else {}) or {}
        if input.site_name is not None: data["siteName"] = input.site_name
        if input.site_url is not None: data["siteUrl"] = input.site_url
        if input.support_email is not None: data["supportEmail"] = input.support_email
        if input.support_phone is not None: data["supportPhone"] = input.support_phone
        if input.address is not None: data["address"] = input.address
        if input.maintenance_mode is not None: data["maintenanceMode"] = input.maintenance_mode
        if input.email_notifications is not None: data["emailNotifications"] = input.email_notifications
        if input.sms_notifications is not None: data["smsNotifications"] = input.sms_notifications
        if input.razorpay_enabled is not None: data["razorpayEnabled"] = input.razorpay_enabled
        if input.razorpay_key is not None: data["razorpayKey"] = input.razorpay_key
        if not row:
            row = AdminSettings(key="main", value=data)
            ctx.session.add(row)
        else:
            row.value = data
        await ctx.session.flush()
        return data

    @strawberry.mutation
    async def admin_update_user_status(
        self,
        info: strawberry.types.Info,
        input: AdminUpdateUserStatusInput,
    ) -> UserType:
        ctx: Context = info.context
        admin = ctx.require_user()
        if admin.role.value != "ADMIN":
            raise PermissionError("Admin only")
        r = await ctx.session.execute(select(User).where(User.id == input.user_id))
        target = r.scalar_one_or_none()
        if not target:
            raise ValueError("User not found")
        try:
            new_status = UserStatus(input.status)
        except ValueError:
            raise ValueError(f"Invalid status: {input.status}. Must be one of ACTIVE, SUSPENDED, INACTIVE")
        target.status = new_status
        await ctx.session.flush()
        import asyncio
        if new_status.value == "SUSPENDED":
            asyncio.create_task(email_svc.send_account_suspended(target.email, target.name))
        elif new_status.value == "ACTIVE":
            asyncio.create_task(email_svc.send_account_activated(target.email, target.name))
        from app.services.user import UserService
        svc = UserService(ctx.session)
        perms = await svc.get_permissions(target)
        return user_to_gql(target, perms)

    @strawberry.mutation
    async def admin_delete_user(
        self,
        info: strawberry.types.Info,
        user_id: str,
    ) -> bool:
        ctx: Context = info.context
        admin = ctx.require_user()
        if admin.role.value != "ADMIN":
            raise PermissionError("Admin only")
        if admin.id == user_id:
            raise ValueError("Cannot delete your own admin account")
        r = await ctx.session.execute(select(User).where(User.id == user_id, User.deleted_at.is_(None)))
        target = r.scalar_one_or_none()
        if not target:
            raise ValueError("User not found")
        from datetime import datetime, timezone
        target.deleted_at = datetime.now(timezone.utc)
        await ctx.session.flush()
        return True

    @strawberry.mutation
    async def admin_update_notary_status(
        self,
        info: strawberry.types.Info,
        notary_id: str,
        is_verified: bool,
    ) -> NotaryType:
        ctx: Context = info.context
        admin = ctx.require_user()
        if admin.role.value != "ADMIN":
            raise PermissionError("Admin only")
        r = await ctx.session.execute(
            select(Notary).where(Notary.id == notary_id, Notary.deleted_at.is_(None))
        )
        notary = r.scalar_one_or_none()
        if not notary:
            raise ValueError("Notary not found")
        from datetime import datetime, timezone
        notary.is_verified = is_verified
        if is_verified and not notary.verification_date:
            notary.verification_date = datetime.now(timezone.utc)
        await ctx.session.flush()
        return notary_to_gql(notary)

    @strawberry.mutation
    async def admin_delete_notary(
        self,
        info: strawberry.types.Info,
        notary_id: str,
    ) -> bool:
        ctx: Context = info.context
        admin = ctx.require_user()
        if admin.role.value != "ADMIN":
            raise PermissionError("Admin only")
        r = await ctx.session.execute(
            select(Notary).where(Notary.id == notary_id, Notary.deleted_at.is_(None))
        )
        notary = r.scalar_one_or_none()
        if not notary:
            raise ValueError("Notary not found")
        from datetime import datetime, timezone
        notary.deleted_at = datetime.now(timezone.utc)
        await ctx.session.flush()
        return True

    @strawberry.mutation
    async def admin_approve_kyc(
        self,
        info: strawberry.types.Info,
        user_id: str,
    ) -> KycResultType:
        ctx: Context = info.context
        admin = ctx.require_user()
        if admin.role.value != "ADMIN":
            raise PermissionError("Admin only")
        from app.models.enums import KycStatus
        from sqlalchemy import select as sa_select
        r = await ctx.session.execute(sa_select(User).where(User.id == user_id, User.deleted_at.is_(None)))
        target = r.scalar_one_or_none()
        if not target:
            raise ValueError("User not found")
        target.kyc_status = KycStatus.APPROVED
        await ctx.session.flush()
        import asyncio
        asyncio.create_task(email_svc.send_kyc_approved(target.email, target.name))
        return KycResultType(success=True, kyc_status=target.kyc_status.value)

    @strawberry.mutation
    async def admin_reject_kyc(
        self,
        info: strawberry.types.Info,
        user_id: str,
    ) -> KycResultType:
        ctx: Context = info.context
        admin = ctx.require_user()
        if admin.role.value != "ADMIN":
            raise PermissionError("Admin only")
        from app.models.enums import KycStatus
        from sqlalchemy import select as sa_select
        r = await ctx.session.execute(sa_select(User).where(User.id == user_id, User.deleted_at.is_(None)))
        target = r.scalar_one_or_none()
        if not target:
            raise ValueError("User not found")
        target.kyc_status = KycStatus.REJECTED
        await ctx.session.flush()
        import asyncio
        asyncio.create_task(email_svc.send_kyc_rejected(target.email, target.name))
        return KycResultType(success=True, kyc_status=target.kyc_status.value)

    @strawberry.mutation
    async def submit_kyc(
        self,
        info: strawberry.types.Info,
        input: SubmitKycInput,
    ) -> KycResultType:
        ctx: Context = info.context
        user = ctx.require_user()
        from app.models.enums import KycStatus
        user.kyc_pan_number = input.pan_number.upper()
        user.kyc_aadhar_last4 = input.aadhar_last4[-4:]
        user.kyc_data = {
            "full_name": input.full_name,
            "dob": input.dob,
            "address": input.address,
            "city": input.city,
            "state": input.state,
            "pincode": input.pincode,
        }
        user.kyc_status = KycStatus.SUBMITTED
        await ctx.session.flush()
        return KycResultType(success=True, kyc_status=user.kyc_status)
