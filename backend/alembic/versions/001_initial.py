"""Initial schema: roles, users, notaries, documents, orders, etc.

Revision ID: 001
Revises:
Create Date: 2025-01-25

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "roles",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("name", sa.String(64), nullable=False),
        sa.Column("permissions", postgresql.ARRAY(sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_roles_name", "roles", ["name"], unique=True)

    op.create_table(
        "users",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(32), nullable=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=True),
        sa.Column("role", sa.Enum("USER", "NOTARY", "ADMIN", name="userrole"), nullable=False),
        sa.Column("status", sa.Enum("ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_VERIFICATION", name="userstatus"), nullable=False),
        sa.Column("email_verified", sa.Boolean(), nullable=False),
        sa.Column("phone_verified", sa.Boolean(), nullable=False),
        sa.Column("role_id", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["role_id"], ["roles.id"]),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_phone", "users", ["phone"])

    op.create_table(
        "refresh_tokens",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("token", sa.String(512), nullable=False),
        sa.Column("revoked", sa.Boolean(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_refresh_tokens_token", "refresh_tokens", ["token"], unique=True)
    op.create_index("ix_refresh_tokens_user_id", "refresh_tokens", ["user_id"])

    op.create_table(
        "addresses",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("label", sa.String(64), nullable=True),
        sa.Column("line1", sa.String(512), nullable=False),
        sa.Column("line2", sa.String(512), nullable=True),
        sa.Column("city", sa.String(128), nullable=False),
        sa.Column("state", sa.String(128), nullable=False),
        sa.Column("pincode", sa.String(16), nullable=False),
        sa.Column("country", sa.String(128), nullable=False),
        sa.Column("is_default", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
    )
    op.create_index("ix_addresses_user_id", "addresses", ["user_id"])

    op.create_table(
        "document_templates",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("slug", sa.String(128), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("category", sa.Enum("PROPERTY", "PERSONAL", "BUSINESS", "LEGAL", "RENT_LEASE", "AFFIDAVITS", "MANAGING_BUSINESS", name="documentcategory"), nullable=False),
        sa.Column("steps", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("default_values", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("field_configs", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_document_templates_slug", "document_templates", ["slug"], unique=True)

    op.create_table(
        "notaries",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(32), nullable=False),
        sa.Column("photo_url", sa.String(1024), nullable=True),
        sa.Column("license_number", sa.String(128), nullable=False),
        sa.Column("bar_council_number", sa.String(128), nullable=False),
        sa.Column("bar_council_state", sa.String(64), nullable=False),
        sa.Column("enrollment_date", sa.Date(), nullable=False),
        sa.Column("experience", sa.Integer(), nullable=False),
        sa.Column("specialization", postgresql.ARRAY(sa.Text()), nullable=False),
        sa.Column("languages", postgresql.ARRAY(sa.Text()), nullable=False),
        sa.Column("location", sa.String(255), nullable=False),
        sa.Column("consultation_fee", sa.Integer(), nullable=False),
        sa.Column("rating", sa.Float(), nullable=False),
        sa.Column("reviews_count", sa.Integer(), nullable=False),
        sa.Column("completed_sessions", sa.Integer(), nullable=False),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("is_verified", sa.Boolean(), nullable=False),
        sa.Column("verification_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("bank_account_holder", sa.String(255), nullable=True),
        sa.Column("bank_account_number", sa.String(64), nullable=True),
        sa.Column("bank_ifsc", sa.String(32), nullable=True),
        sa.Column("bank_name", sa.String(128), nullable=True),
        sa.Column("bank_branch", sa.String(128), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
    )
    op.create_index("ix_notaries_user_id", "notaries", ["user_id"], unique=True)
    op.create_index("ix_notaries_email", "notaries", ["email"])

    op.create_table(
        "notary_availability",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("notary_id", sa.String(), nullable=False),
        sa.Column("days", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("break_start", sa.String(8), nullable=True),
        sa.Column("break_end", sa.String(8), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["notary_id"], ["notaries.id"]),
    )
    op.create_index("ix_notary_availability_notary_id", "notary_availability", ["notary_id"], unique=True)

    op.create_table(
        "notary_applications",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("application_number", sa.String(32), nullable=False),
        sa.Column("user_id", sa.String(), nullable=True),
        sa.Column("first_name", sa.String(128), nullable=False),
        sa.Column("middle_name", sa.String(128), nullable=True),
        sa.Column("last_name", sa.String(128), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(32), nullable=False),
        sa.Column("license_number", sa.String(128), nullable=True),
        sa.Column("bar_council_number", sa.String(128), nullable=True),
        sa.Column("experience", sa.String(64), nullable=True),
        sa.Column("specialization", sa.String(255), nullable=True),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("status", sa.Enum("PENDING", "APPROVED", "REJECTED", name="notaryapplicationstatus"), nullable=False),
        sa.Column("documents", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("applied_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
    )
    op.create_index("ix_notary_applications_application_number", "notary_applications", ["application_number"], unique=True)

    op.create_table(
        "documents",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("notary_id", sa.String(), nullable=True),
        sa.Column("order_id", sa.String(), nullable=True),
        sa.Column("template_id", sa.String(), nullable=False),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("category", sa.Enum("PROPERTY", "PERSONAL", "BUSINESS", "LEGAL", "RENT_LEASE", "AFFIDAVITS", "MANAGING_BUSINESS", name="documentcategory"), nullable=False),
        sa.Column("status", sa.Enum("DRAFT", "IN_PROGRESS", "NOTARIZED", "COMPLETED", "CANCELLED", name="documentstatus"), nullable=False),
        sa.Column("form_data", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("completion_percentage", sa.Integer(), nullable=True),
        sa.Column("current_step", sa.Integer(), nullable=True),
        sa.Column("pdf_url", sa.String(1024), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["notary_id"], ["notaries.id"]),
        sa.ForeignKeyConstraint(["template_id"], ["document_templates.id"]),
    )
    op.create_index("ix_documents_user_id", "documents", ["user_id"])
    op.create_index("ix_documents_order_id", "documents", ["order_id"])
    op.create_index("ix_documents_template_id", "documents", ["template_id"])

    op.create_table(
        "orders",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("order_number", sa.String(32), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("document_id", sa.String(), nullable=True),
        sa.Column("appointment_id", sa.String(), nullable=True),
        sa.Column("delivery_address_id", sa.String(), nullable=True),
        sa.Column("type", sa.Enum("PHYSICAL_DELIVERY", "VIDEO_CONSULTATION", name="ordertype"), nullable=False),
        sa.Column("status", sa.Enum("PENDING", "PAID", "PROCESSING", "NOTARIZED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED", name="orderstatus"), nullable=False),
        sa.Column("base_price", sa.Integer(), nullable=False),
        sa.Column("delivery_fee", sa.Integer(), nullable=True),
        sa.Column("discount", sa.Integer(), nullable=True),
        sa.Column("total_amount", sa.Integer(), nullable=False),
        sa.Column("coupon_code", sa.String(64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"]),
        sa.ForeignKeyConstraint(["delivery_address_id"], ["addresses.id"]),
    )
    op.create_index("ix_orders_order_number", "orders", ["order_number"], unique=True)
    op.create_index("ix_orders_user_id", "orders", ["user_id"])

    op.create_table(
        "appointments",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("notary_id", sa.String(), nullable=False),
        sa.Column("order_id", sa.String(), nullable=True),
        sa.Column("document_type", sa.String(128), nullable=True),
        sa.Column("scheduled_date", sa.Date(), nullable=False),
        sa.Column("scheduled_time", sa.String(32), nullable=False),
        sa.Column("status", sa.Enum("PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW", name="appointmentstatus"), nullable=False),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("meeting_link", sa.String(512), nullable=True),
        sa.Column("notes", sa.String(1024), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["notary_id"], ["notaries.id"]),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"]),
    )
    op.create_index("ix_appointments_user_id", "appointments", ["user_id"])
    op.create_index("ix_appointments_notary_id", "appointments", ["notary_id"])
    op.create_index("ix_appointments_order_id", "appointments", ["order_id"])

    op.create_table(
        "payments",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("order_id", sa.String(), nullable=False),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(8), nullable=False),
        sa.Column("status", sa.Enum("PENDING", "COMPLETED", "FAILED", "REFUNDED", name="paymentstatus"), nullable=False),
        sa.Column("method", sa.Enum("CARD", "UPI", "NET_BANKING", "WALLET", name="paymentmethod"), nullable=False),
        sa.Column("razorpay_order_id", sa.String(128), nullable=True),
        sa.Column("razorpay_payment_id", sa.String(128), nullable=True),
        sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"]),
    )
    op.create_index("ix_payments_order_id", "payments", ["order_id"])

    op.create_table(
        "deliveries",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("order_id", sa.String(), nullable=False),
        sa.Column("document_name", sa.String(512), nullable=False),
        sa.Column("status", sa.Enum("PROCESSING", "PRINTED_PACKED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", name="deliverystatus"), nullable=False),
        sa.Column("courier_partner", sa.String(128), nullable=False),
        sa.Column("tracking_number", sa.String(128), nullable=False),
        sa.Column("current_location", sa.String(256), nullable=True),
        sa.Column("expected_delivery", sa.Date(), nullable=True),
        sa.Column("stages", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"]),
    )
    op.create_index("ix_deliveries_order_id", "deliveries", ["order_id"])

    op.create_table(
        "services",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("price", sa.String(32), nullable=False),
        sa.Column("base_price", sa.Integer(), nullable=True),
        sa.Column("delivery_fee", sa.Integer(), nullable=True),
        sa.Column("flow", postgresql.ARRAY(sa.Text()), nullable=False),
        sa.Column("features", postgresql.ARRAY(sa.Text()), nullable=False),
        sa.Column("includes", postgresql.ARRAY(sa.Text()), nullable=False),
        sa.Column("popular", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "faqs",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("category", sa.Enum("GENERAL", "DOCUMENTS", "NOTARIZATION", "PRICING", "DELIVERY", "ACCOUNT", name="faqcategory"), nullable=False),
        sa.Column("question", sa.Text(), nullable=False),
        sa.Column("answer", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "contact_submissions",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(32), nullable=True),
        sa.Column("subject", sa.String(255), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "reviews",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("notary_id", sa.String(), nullable=False),
        sa.Column("session_id", sa.String(), nullable=True),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["notary_id"], ["notaries.id"]),
    )
    op.create_index("ix_reviews_user_id", "reviews", ["user_id"])
    op.create_index("ix_reviews_notary_id", "reviews", ["notary_id"])

    op.create_table(
        "pricing_plans",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("name", sa.String(128), nullable=False),
        sa.Column("price", sa.String(32), nullable=False),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("period", sa.String(32), nullable=True),
        sa.Column("features", postgresql.ARRAY(sa.Text()), nullable=False),
        sa.Column("popular", sa.Boolean(), nullable=True),
        sa.Column("cta", sa.String(128), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "admin_settings",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("key", sa.String(128), nullable=False),
        sa.Column("value", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_admin_settings_key", "admin_settings", ["key"], unique=True)


def downgrade() -> None:
    op.drop_table("admin_settings")
    op.drop_table("pricing_plans")
    op.drop_index("ix_reviews_notary_id", "reviews")
    op.drop_index("ix_reviews_user_id", "reviews")
    op.drop_table("reviews")
    op.drop_table("contact_submissions")
    op.drop_table("faqs")
    op.drop_table("services")
    op.drop_index("ix_deliveries_order_id", "deliveries")
    op.drop_table("deliveries")
    op.drop_index("ix_payments_order_id", "payments")
    op.drop_table("payments")
    op.drop_index("ix_appointments_order_id", "appointments")
    op.drop_index("ix_appointments_notary_id", "appointments")
    op.drop_index("ix_appointments_user_id", "appointments")
    op.drop_table("appointments")
    op.drop_index("ix_orders_user_id", "orders")
    op.drop_index("ix_orders_order_number", "orders")
    op.drop_table("orders")
    op.drop_index("ix_documents_template_id", "documents")
    op.drop_index("ix_documents_order_id", "documents")
    op.drop_index("ix_documents_user_id", "documents")
    op.drop_table("documents")
    op.drop_index("ix_notary_applications_application_number", "notary_applications")
    op.drop_table("notary_applications")
    op.drop_index("ix_notary_availability_notary_id", "notary_availability")
    op.drop_table("notary_availability")
    op.drop_index("ix_notaries_email", "notaries")
    op.drop_index("ix_notaries_user_id", "notaries")
    op.drop_table("notaries")
    op.drop_index("ix_document_templates_slug", "document_templates")
    op.drop_table("document_templates")
    op.drop_index("ix_addresses_user_id", "addresses")
    op.drop_table("addresses")
    op.drop_index("ix_refresh_tokens_user_id", "refresh_tokens")
    op.drop_index("ix_refresh_tokens_token", "refresh_tokens")
    op.drop_table("refresh_tokens")
    op.drop_index("ix_users_phone", "users")
    op.drop_index("ix_users_email", "users")
    op.drop_table("users")
    op.drop_index("ix_roles_name", "roles")
    op.drop_table("roles")

    op.execute("DROP TYPE IF EXISTS userrole")
    op.execute("DROP TYPE IF EXISTS userstatus")
    op.execute("DROP TYPE IF EXISTS documentcategory")
    op.execute("DROP TYPE IF EXISTS documentstatus")
    op.execute("DROP TYPE IF EXISTS ordertype")
    op.execute("DROP TYPE IF EXISTS orderstatus")
    op.execute("DROP TYPE IF EXISTS appointmentstatus")
    op.execute("DROP TYPE IF EXISTS paymentstatus")
    op.execute("DROP TYPE IF EXISTS paymentmethod")
    op.execute("DROP TYPE IF EXISTS deliverystatus")
    op.execute("DROP TYPE IF EXISTS faqcategory")
    op.execute("DROP TYPE IF EXISTS notaryapplicationstatus")
