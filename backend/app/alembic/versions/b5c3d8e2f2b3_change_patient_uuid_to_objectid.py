"""change patient_uuid_map id from UUID to ObjectId

Revision ID: b5c3d8e2f2b3
Revises: a4b2c7e1f1a2
Create Date: 2026-01-29
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "b5c3d8e2f2b3"
down_revision = "a4b2c7e1f1a2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Table was deleted, so just create it fresh with String-based ObjectId
    op.create_table(
        "patient_uuid_map",
        sa.Column("id", sa.String(24), primary_key=True, nullable=False),
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


