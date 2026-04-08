"""Add KYC fields to users table

Revision ID: 003
Revises: 002
Create Date: 2026-04-09

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE TYPE kycstatus AS ENUM ('NOT_SUBMITTED', 'SUBMITTED', 'APPROVED', 'REJECTED')")
    op.add_column("users", sa.Column("kyc_status", sa.Enum("NOT_SUBMITTED", "SUBMITTED", "APPROVED", "REJECTED", name="kycstatus"), nullable=False, server_default="NOT_SUBMITTED"))
    op.add_column("users", sa.Column("kyc_pan_number", sa.String(10), nullable=True))
    op.add_column("users", sa.Column("kyc_aadhar_last4", sa.String(4), nullable=True))
    op.add_column("users", sa.Column("kyc_data", JSONB, nullable=True))


def downgrade() -> None:
    op.drop_column("users", "kyc_data")
    op.drop_column("users", "kyc_aadhar_last4")
    op.drop_column("users", "kyc_pan_number")
    op.drop_column("users", "kyc_status")
    op.execute("DROP TYPE kycstatus")
