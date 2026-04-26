import uuid
from datetime import datetime, timezone

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import (
    ConflictException,
    UnauthorizedException,
)
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
    verify_refresh_token,
)
from app.models.user import User, UserStats
from app.redis_client import cache_delete, cache_set
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    TokenResponse,
)
from app.schemas.user import UserSchema

logger = structlog.get_logger()

_REDIS_USER_TTL = 300


async def _load_user_with_stats(db: AsyncSession, user_id: uuid.UUID) -> User:
    result = await db.execute(
        select(User)
        .where(User.id == user_id)
        .options(selectinload(User.stats))
    )
    return result.scalar_one()


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def register(self, data: RegisterRequest) -> AuthResponse:
        logger.info("register_step", step="start", email=data.email)
        try:
            existing = await self.db.execute(
                select(User).where(User.email == data.email)
            )
            logger.info("register_step", step="email_check_done")
        except Exception as e:
            logger.error("register_step_failed", step="email_check", error=str(e))
            raise

        if existing.scalar_one_or_none():
            logger.info("register_step", step="email_exists")
            raise ConflictException("An account with this email already exists")

        try:
            hashed = await hash_password(data.password)
            logger.info("register_step", step="password_hashed")
        except Exception as e:
            logger.error("register_step_failed", step="hash_password", error=str(e))
            raise

        user = User(
            name=data.name,
            email=data.email,
            hashed_password=hashed,
            college=data.college,
            city=data.city,
            is_verified=True,
            auth_provider="email",
        )
        self.db.add(user)
        try:
            await self.db.flush()
            logger.info("register_step", step="user_flushed", user_id=str(user.id))
        except Exception as e:
            logger.error("register_step_failed", step="user_flush", error=str(e))
            raise

        self.db.add(UserStats(user_id=user.id))

        access_token = create_access_token(str(user.id))
        refresh_token = create_refresh_token(str(user.id))
        user.refresh_token = refresh_token
        user.last_login_at = datetime.now(timezone.utc)

        try:
            await self.db.commit()
            logger.info("register_step", step="committed")
        except Exception as e:
            logger.error("register_step_failed", step="commit", error=str(e))
            raise

        user = await _load_user_with_stats(self.db, user.id)

        logger.info("user_registered", user_id=str(user.id))
        return AuthResponse(
            user=UserSchema.model_validate(user),
            access_token=access_token,
            refresh_token=refresh_token,
        )

    async def login(self, data: LoginRequest) -> AuthResponse:
        result = await self.db.execute(
            select(User)
            .where(User.email == data.email, User.is_active == True)
            .options(selectinload(User.stats))
        )
        user = result.scalar_one_or_none()

        if not user or not user.hashed_password:
            raise UnauthorizedException("Invalid email or password")
        if not await verify_password(data.password, user.hashed_password):
            raise UnauthorizedException("Invalid email or password")

        access_token = create_access_token(
            str(user.id), extra={"is_admin": user.is_admin}
        )
        refresh_token = create_refresh_token(str(user.id))
        user.refresh_token = refresh_token
        user.last_login_at = datetime.now(timezone.utc)
        await self.db.commit()

        user_schema = UserSchema.model_validate(user)
        await cache_set(
            f"user:{user.id}", user_schema.model_dump(mode="json"), ttl=_REDIS_USER_TTL
        )

        logger.info("user_logged_in", user_id=str(user.id))
        return AuthResponse(
            user=user_schema,
            access_token=access_token,
            refresh_token=refresh_token,
        )

    async def logout(self, user: User) -> None:
        user.refresh_token = None
        await self.db.commit()
        await cache_delete(f"user:{user.id}")
        logger.info("user_logged_out", user_id=str(user.id))

    async def refresh_tokens(self, refresh_token: str) -> TokenResponse:
        user_id = verify_refresh_token(refresh_token)
        if not user_id:
            raise UnauthorizedException("Invalid or expired refresh token")

        result = await self.db.execute(
            select(User).where(User.id == uuid.UUID(user_id), User.is_active == True)
        )
        user = result.scalar_one_or_none()

        if not user or user.refresh_token != refresh_token:
            raise UnauthorizedException("Refresh token mismatch or revoked")

        new_access = create_access_token(
            str(user.id), extra={"is_admin": user.is_admin}
        )
        new_refresh = create_refresh_token(str(user.id))
        user.refresh_token = new_refresh
        await self.db.commit()

        return TokenResponse(access_token=new_access, refresh_token=new_refresh)

