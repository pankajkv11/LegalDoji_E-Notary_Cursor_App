"""GraphQL mutations."""
from datetime import date, datetime, timezone
from typing import Optional, List

import strawberry
from sqlalchemy import select, cast, String

from app.graphql.context import Context
from app.graphql.types import (
    UserType,
    DocumentType,
    OrderGql,
    PaymentType,
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
    SignupResponseType,
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
    VerifyOtpInput,
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
from app.services.order import OrderService
from app.repositories.address import AddressRepository
from app.repositories.appointment import AppointmentRepository
from app.models.address import Address
from app.models.appointment import Appointment
from app.models.order import Order
from app.models.notary import NotaryApplication
from app.models.enums import AppointmentStatus, NotaryApplicationStatus
import uuid
import random
import string


def _app_number() -> str:
    return "NOT-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=10))


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def signup(self, info: strawberry.types.Info, input: SignupInput) -> SignupResponseType:
        """
        Register a new user. Creates account with PENDING_VERIFICATION status.
        Returns a temp_token for OTP verification.
        """
        ctx: Context = info.context
        svc = AuthService(ctx.session)
        try:
            result = await svc.signup(
                name=input.name,
                email=input.email,
                phone=input.phone,
                password=input.password,
                accept_terms=input.accept_terms,
            )
        except ValueError as e:
            # Re-raise ValueError with clear message
            raise ValueError(str(e))
        except Exception as e:
            # Wrap other exceptions in ValueError for consistent error handling
            raise ValueError(f"Signup failed: {str(e)}")
        
        return SignupResponseType(
            success=result["success"],
            message=result["message"],
            temp_token=result["temp_token"],
            expires_in=result["expires_in"],
            user_id=result["user_id"],
            email=result["email"],
            phone=result["phone"],
        )

    @strawberry.mutation
    async def verify_otp(self, info: strawberry.types.Info, input: VerifyOtpInput) -> AuthPayloadType:
        """
        Verify OTP and activate user account.
        Returns auth tokens on successful verification.
        """
        ctx: Context = info.context
        svc = AuthService(ctx.session)
        try:
            result = await svc.verify_otp(
                temp_token=input.temp_token,
                otp=input.otp,
            )
        except ValueError as e:
            raise ValueError(str(e))
        except Exception as e:
            raise ValueError(f"OTP verification failed: {str(e)}")
        
        if not result:
            raise ValueError("OTP verification failed")
        
        user, access, refresh, expires = result
        usvc = UserService(ctx.session)
        perms = usvc.permissions_for_user(user)
        return AuthPayloadType(
            access_token=access,
            refresh_token=refresh,
            expires_in=expires,
            user=user_to_gql(user, perms),
        )

    @strawberry.mutation
    async def resend_otp(self, info: strawberry.types.Info, temp_token: str) -> SignupResponseType:
        """
        Resend OTP for verification.
        Returns a new temp token with extended expiry.
        """
        ctx: Context = info.context
        svc = AuthService(ctx.session)
        try:
            result = await svc.resend_otp(temp_token=temp_token)
        except ValueError as e:
            raise ValueError(str(e))
        except Exception as e:
            raise ValueError(f"Failed to resend OTP: {str(e)}")
        
        # Decode the new token to get user info
        from app.services.auth import decode_verification_token
        token_data = decode_verification_token(result["new_token"])
        
        return SignupResponseType(
            success=result["success"],
            message=result["message"],
            temp_token=result["new_token"],
            expires_in=result["expires_in"],
            user_id=token_data["sub"] if token_data else "",
            email=token_data["email"] if token_data else "",
            phone=token_data["phone"] if token_data else "",
        )

    @strawberry.mutation
    async def login(self, info: strawberry.types.Info, input: LoginInput) -> Optional[AuthPayloadType]:
        ctx: Context = info.context
        try:
            svc = AuthService(ctx.session)
            if input.method == "EMAIL" and input.email and input.password:
                out = await svc.login_email_password(input.email, input.password)
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
        except ValueError as e:
            # Re-raise ValueError with clear message
            raise ValueError(str(e))
        except Exception as e:
            # Wrap other exceptions in ValueError for consistent error handling
            raise ValueError(f"Login failed: {str(e)}")

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
    async def create_appointment(
        self,
        info: strawberry.types.Info,
        input: CreateAppointmentInput,
    ) -> AppointmentType:
        ctx: Context = info.context
        user = ctx.require_user()
        from app.models.notary import Notary
        from sqlalchemy import select
        n = await ctx.session.execute(select(Notary).where(cast(Notary.id, String) == input.notary_id, Notary.deleted_at.is_(None)))
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
        return OTPResponseType(
            success=True,
            message="OTP sent successfully.",
            expires_in=300,
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
        app = NotaryApplication(
            application_number=_app_number(),
            user_id=ctx.user.id if ctx.user else None,
            first_name=input.first_name,
            middle_name=input.middle_name,
            last_name=input.last_name,
            email=input.email,
            phone=input.phone,
            status=NotaryApplicationStatus.PENDING,
        )
        ctx.session.add(app)
        await ctx.session.flush()
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
    ) -> PaymentType:
        ctx: Context = info.context
        user = ctx.require_user()
        from app.models.order import Payment
        # Use select with cast for type safety
        from app.models.order import Order
        o_result = await ctx.session.execute(select(Order).where(cast(Order.id, String) == order_id))
        o = o_result.scalar_one_or_none()
        if not o or cast(Order.user_id, String) != str(user.id):
            raise ValueError("Order not found")
        r = await ctx.session.execute(select(Payment).where(cast(Payment.order_id, String) == order_id))
        pay = r.scalar_one_or_none()
        if not pay:
            raise ValueError("Payment not found")
        pay.razorpay_payment_id = razorpay_payment_id
        pay.status = PaymentStatus.COMPLETED
        pay.paid_at = datetime.now(timezone.utc)
        await ctx.session.flush()
        return payment_to_gql(pay)

    @strawberry.mutation
    async def accept_appointment(self, info: strawberry.types.Info, appointment_id: str) -> AppointmentType:
        ctx: Context = info.context
        user = ctx.require_user()
        from app.models.notary import Notary
        nr = await ctx.session.execute(select(Notary).where(cast(Notary.user_id, String) == str(user.id)))
        notary = nr.scalar_one_or_none()
        if not notary:
            raise ValueError("Notary profile not found")
        r = await ctx.session.execute(
            select(Appointment).where(cast(Appointment.id, String) == appointment_id, Appointment.deleted_at.is_(None))
        )
        apt = r.scalar_one_or_none()
        if not apt or apt.notary_id != notary.id:
            raise ValueError("Appointment not found")
        apt.status = AppointmentStatus.CONFIRMED
        await ctx.session.flush()
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
        nr = await ctx.session.execute(select(Notary).where(cast(Notary.user_id, String) == str(user.id)))
        notary = nr.scalar_one_or_none()
        if not notary:
            raise ValueError("Notary profile not found")
        r = await ctx.session.execute(
            select(Appointment).where(cast(Appointment.id, String) == appointment_id, Appointment.deleted_at.is_(None))
        )
        apt = r.scalar_one_or_none()
        if not apt or apt.notary_id != notary.id:
            raise ValueError("Appointment not found")
        apt.status = AppointmentStatus.CANCELLED
        if reason:
            apt.notes = (apt.notes or "") + f"\nRejected: {reason}"
        await ctx.session.flush()
        return appointment_to_gql(apt)

    @strawberry.mutation
    async def cancel_appointment(self, info: strawberry.types.Info, appointment_id: str) -> AppointmentType:
        ctx: Context = info.context
        user = ctx.require_user()
        r = await ctx.session.execute(
            select(Appointment).where(cast(Appointment.id, String) == appointment_id, Appointment.deleted_at.is_(None))
        )
        apt = r.scalar_one_or_none()
        if not apt or apt.user_id != user.id:
            raise ValueError("Appointment not found")
        apt.status = AppointmentStatus.CANCELLED
        await ctx.session.flush()
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
        from app.models.notary import NotaryApplication
        r = await ctx.session.execute(
            select(NotaryApplication).where(cast(NotaryApplication.id, String) == application_id)
        )
        app = r.scalar_one_or_none()
        if not app:
            raise ValueError("Application not found")
        app.status = NotaryApplicationStatus.APPROVED
        app.reviewed_at = datetime.now(timezone.utc)
        await ctx.session.flush()
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
            select(NotaryApplication).where(cast(NotaryApplication.id, String) == application_id)
        )
        app = r.scalar_one_or_none()
        if not app:
            raise ValueError("Application not found")
        app.status = NotaryApplicationStatus.REJECTED
        app.reviewed_at = datetime.now(timezone.utc)
        if reason:
            app.documents = {**(app.documents or {}), "reject_reason": reason}
        await ctx.session.flush()
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
        if input.maintenance_mode is not None: data["maintenanceMode"] = input.maintenance_mode
        if not row:
            row = AdminSettings(key="main", value=data)
            ctx.session.add(row)
        else:
            row.value = data
        await ctx.session.flush()
        return data
