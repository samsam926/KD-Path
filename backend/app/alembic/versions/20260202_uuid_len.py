"""update patient_uuid_map id length to UUID

Revision ID: 20260202_uuid_len
Revises: b5c3d8e2f2b3
Create Date: 2026-02-02
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20260202_uuid_len"
down_revision = "b5c3d8e2f2b3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "patient_uuid_map",
        "id",
        existing_type=sa.String(length=24),
        type_=sa.String(length=36),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "patient_uuid_map",
        "id",
        existing_type=sa.String(length=36),
        type_=sa.String(length=24),
        existing_nullable=False,
    )