import uuid
from datetime import date
from decimal import Decimal

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import BadRequestException, NotFoundException
from app.core.security import verify_password
from app.models.achievement import Achievement
from app.models.budget import Budget
from app.models.user import User, UserStats
from app.redis_client import cache_delete
from app.schemas.user import (
    ChangePasswordRequest,
    DeleteAccountRequest,
    OnboardingRequest,
    OnboardingResponse,
    UpdateUserRequest,
    UserSchema,
)

logger = structlog.get_logger()


class UserService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_me(self, user_id: uuid.UUID) -> UserSchema:
        result = await self.db.execute(
            select(User)
            .where(User.id == user_id, User.is_active == True)
            .options(selectinload(User.stats))
        )
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundException("User not found")
        return UserSchema.model_validate(user)

    async def update_me(self, user: User, data: UpdateUserRequest) -> UserSchema:
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(user, field, value)
        await self.db.commit()
        await cache_delete(f"user:{user.id}")

        result = await self.db.execute(
            select(User)
            .where(User.id == user.id)
            .options(selectinload(User.stats))
        )
        user = result.scalar_one()
        return UserSchema.model_validate(user)

    async def complete_onboarding(
        self, user: User, data: OnboardingRequest
    ) -> OnboardingResponse:
        user.college = data.college
        user.city = data.city
        user.monthly_income = data.monthly_income
        user.onboarding_done = True

        today = date.today()
        budget = Budget(
            user_id=user.id,
            month=today.month,
            year=today.year,
            monthly_limit=data.monthly_limit,
            category_limits={},
            savings_goal=Decimal("0.00"),
        )
        self.db.add(budget)

        welcome_badge = Achievement(
            user_id=user.id,
            badge_id="welcome",
            badge_name="Welcome Aboard",
            xp_awarded=10,
        )
        self.db.add(welcome_badge)

        result = await self.db.execute(
            select(UserStats).where(UserStats.user_id == user.id)
        )
        stats = result.scalar_one_or_none()
        if stats:
            stats.total_xp += 10

        await self.db.commit()
        await cache_delete(f"user:{user.id}")

        result = await self.db.execute(
            select(User)
            .where(User.id == user.id)
            .options(selectinload(User.stats))
        )
        user = result.scalar_one()
        return OnboardingResponse(user=UserSchema.model_validate(user))

    async def change_password(self, user: User, data: ChangePasswordRequest) -> None:
        if not user.hashed_password or not verify_password(
            data.current_password, user.hashed_password
        ):
            raise BadRequestException("Current password is incorrect")
        from app.core.security import hash_password
        user.hashed_password = hash_password(data.new_password)
        user.refresh_token = None
        await self.db.commit()
        await cache_delete(f"user:{user.id}")
        logger.info("password_changed", user_id=str(user.id))

    async def delete_me(self, user: User, data: DeleteAccountRequest) -> None:
        if not user.hashed_password or not verify_password(
            data.password, user.hashed_password
        ):
            raise BadRequestException("Incorrect password")

        user.is_active = False
        user.refresh_token = None
        user.email = f"deleted_{user.id}@deleted.invalid"
        await self.db.commit()
        await cache_delete(f"user:{user.id}")
        logger.info("user_account_deleted", user_id=str(user.id))
