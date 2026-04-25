import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional
from sqlalchemy import Integer, Numeric, DateTime, String, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.models.base import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    month: Mapped[int] = mapped_column(Integer, nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    predicted_total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    predicted_by_category: Mapped[dict] = mapped_column(
        JSONB, nullable=False, default=dict
    )
    confidence_score: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(5, 4), nullable=True
    )
    model_used: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    actual_total: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(12, 2), nullable=True
    )
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    def __repr__(self) -> str:
        return f"<Prediction user={self.user_id} {self.month}/{self.year} pred={self.predicted_total}>"
