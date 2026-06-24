from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ConsultedScan(Base):
    __tablename__ = "consulted_scans"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    query_hash: Mapped[str] = mapped_column(String(64), index=True, default="")
    search_type: Mapped[str] = mapped_column(String(80))
    risk_score: Mapped[float] = mapped_column(Float)
    total_logins: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
