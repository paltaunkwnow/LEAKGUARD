from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

engine = create_async_engine(settings.database_url, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session


async def init_db() -> None:
    from app.models import audit_log, consulted_scan, incident, notification, user  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # create_all no altera tablas existentes; parches mínimos de esquema
        await conn.exec_driver_sql(
            "ALTER TABLE consulted_scans "
            "ADD COLUMN IF NOT EXISTS query_hash VARCHAR(64) NOT NULL DEFAULT ''"
        )
        await conn.exec_driver_sql(
            "CREATE INDEX IF NOT EXISTS ix_consulted_scans_query_hash "
            "ON consulted_scans (query_hash)"
        )
