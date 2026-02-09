"""add patient_uuid_map

Revision ID: a4b2c7e1f1a2
Revises: fe56fa70289e
Create Date: 2026-01-29
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "a4b2c7e1f1a2"
down_revision = "fe56fa70289e"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "patient_uuid_map",
        sa.Column("id", sa.String(length=24), primary_key=True, nullable=False),
        sa.Column("patient_deiden_id", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.UniqueConstraint("patient_deiden_id", name="uq_patient_uuid_map_patient_deiden_id"),
    )
    op.create_index(
        "ix_patient_uuid_map_patient_deiden_id",
        "patient_uuid_map",
        ["patient_deiden_id"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index("ix_patient_uuid_map_patient_deiden_id", table_name="patient_uuid_map")
    op.drop_table("patient_uuid_map")