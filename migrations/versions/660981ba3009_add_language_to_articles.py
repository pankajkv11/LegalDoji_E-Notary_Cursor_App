"""add language to articles

Revision ID: 660981ba3009
Revises: ca8d317c3306
Create Date: 2026-01-22 16:50:07.397758

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '660981ba3009'
down_revision: Union[str, None] = 'c25593e590c5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column(
        "articles",
        sa.Column("language", sa.String(length=5), nullable=True)
    )

def downgrade():
    op.drop_column("articles", "language")