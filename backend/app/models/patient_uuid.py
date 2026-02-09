import uuid
from datetime import datetime
from sqlalchemy import Column, String

from app.utils import get_datetime_utc
from sqlmodel import Field, SQLModel

class PatientUUIDMap(SQLModel, table=True):
    __tablename__ = "patient_uuid_map"

    id: str = Field(
        sa_column=Column("id", String(36), primary_key=True),
        default_factory=lambda: str(uuid.uuid4())
    )
    patient_deiden_id: str = Field(index=True, unique=True)
    created_at: datetime | None = Field(default_factory=get_datetime_utc)