import uuid
from datetime import datetime, date
from decimal import Decimal
from typing import Optional
from sqlalchemy import String, Boolean, Numeric, DateTime, Date, Text, Integer, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(15), nullable=True)
    college: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    monthly_income: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=Decimal("0.00"), nullable=False
    )
    auth_provider: Mapped[str] = mapped_column(
        String(20), default="email", nullable=False
    )
    google_id: Mapped[Optional[str]] = mapped_column(
        String(100), unique=True, nullable=True, index=True
    )
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    onboarding_done: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    refresh_token: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    expenses: Mapped[list["Expense"]] = relationship(  # type: ignore[name-defined]
        back_populates="user", cascade="all, delete-orphan", lazy="select"
    )
    budgets: Mapped[list["Budget"]] = relationship(  # type: ignore[name-defined]
        back_populates="user", cascade="all, delete-orphan", lazy="select"
    )
    notifications: Mapped[list["Notification"]] = relationship(  # type: ignore[name-defined]
        back_populates="user", cascade="all, delete-orphan", lazy="select"
    )
    achievements: Mapped[list["Achievement"]] = relationship(  # type: ignore[name-defined]
        back_populates="user", cascade="all, delete-orphan", lazy="select"
    )
    stats: Mapped[Optional["UserStats"]] = relationship(  # type: ignore[name-defined]
        back_populates="user", cascade="all, delete-orphan", uselist=False, lazy="select"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email}>"


class UserStats(Base):
    __tablename__ = "user_stats"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    total_xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    current_level: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    current_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_active_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    total_saved: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=Decimal("0.00"), nullable=False
    )
    monthly_challenges_completed: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )
    smart_spender_rank: Mapped[str] = mapped_column(
        String(20), default="bronze", nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="stats")

    def __repr__(self) -> str:
        return f"<UserStats user_id={self.user_id} xp={self.total_xp} level={self.current_level}>"
