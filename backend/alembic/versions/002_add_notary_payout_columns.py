"""Add pending_payout_amount and payout_requested_at to notaries

Revision ID: 002
Revises: 001
Create Date: 2026-04-04

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "notaries",
        sa.Column("pending_payout_amount", sa.Integer(), nullable=True),
    )
    op.add_column(
        "notaries",
        sa.Column("payout_requested_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("notaries", "payout_requested_at")
    op.drop_column("notaries", "pending_payout_amount")
