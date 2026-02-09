"""noop placeholder (superseded by 20260202_uuid_len)

Revision ID: 20260202_uuid_len2
Revises: 20260202_uuid_len
Create Date: 2026-02-02
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20260202_uuid_len2"
down_revision = "20260202_uuid_len"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # No-op: superseded by 20260202_uuid_len
    pass


def downgrade() -> None:
    # No-op: superseded by 20260202_uuid_len
    pass