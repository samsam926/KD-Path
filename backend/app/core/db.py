from sqlmodel import Session, create_engine, select
from sqlalchemy.types import TypeDecorator, String
import uuid

from app import crud
from app.core.config import settings
from app.models.user import User, UserCreate


# Custom SQLAlchemy type for UUID
class UUIDType(TypeDecorator):
    """SQLAlchemy type for UUID."""
    impl = String(36)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, uuid.UUID):
            return str(value)
        return value

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        return uuid.UUID(value)


# Main application database engine
engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))

# Patients database engine (if configured)
patients_engine = None
if settings.PATIENTS_DATABASE_URI:
    patients_engine = create_engine(str(settings.PATIENTS_DATABASE_URI))


# make sure all SQLModel models are imported (app.models) before initializing DB
# otherwise, SQLModel might fail to initialize relationships properly
# for more details: https://github.com/fastapi/full-stack-fastapi-template/issues/28


def init_db(session: Session) -> None:
    # Tables should be created with Alembic migrations
    # But if you don't want to use migrations, create
    # the tables un-commenting the next lines
    # from sqlmodel import SQLModel

    # This works because the models are already imported and registered from app.models
    # SQLModel.metadata.create_all(engine)

    user = session.exec(
        select(User).where(User.email == settings.FIRST_SUPERUSER)
    ).first()
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
        )
        user = crud.create_user(session=session, user_create=user_in)
