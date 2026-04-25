import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional
from sqlalchemy import Integer, Boolean, Numeric, DateTime, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.models.base import Base, TimestampMixin


class Budget(Base, TimestampMixin):
    __tablename__ = "budgets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    month: Mapped[int] = mapped_column(Integer, nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    monthly_limit: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    category_limits: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    rollover_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    savings_goal: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=Decimal("0.00"), nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="budgets")  # type: ignore[name-defined]

    __table_args__ = (
        UniqueConstraint("user_id", "month", "year", name="uq_budget_user_month_year"),
        Index("idx_budgets_user_month", "user_id", "year", "month"),
    )

    def __repr__(self) -> str:
        return f"<Budget user={self.user_id} {self.month}/{self.year} limit={self.monthly_limit}>"
