import uuid
from datetime import datetime, timezone, timedelta
from math import ceil

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import BadRequestException, NotFoundException
from app.models.user import User, UserStats
from app.models.expense import Expense
from app.models.notification import Notification
from app.redis_client import cache_delete
from app.schemas.admin import AdminStatsResponse, AdminUsersResponse, AdminUserItem

import structlog

log = structlog.get_logger()


class AdminService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_stats(self) -> AdminStatsResponse:
        now = datetime.now(timezone.utc)
        today = now.date()
        week_ago = today - timedelta(days=7)
        month_start = today.replace(day=1)

        total_users = (await self.db.execute(
            select(func.count()).select_from(User)
        )).scalar_one()

        active_today = (await self.db.execute(
            select(func.count()).select_from(UserStats).where(
                UserStats.last_active_date == today
            )
        )).scalar_one()

        active_this_week = (await self.db.execute(
            select(func.count()).select_from(UserStats).where(
                UserStats.last_active_date >= week_ago
            )
        )).scalar_one()

        total_expenses = (await self.db.execute(
            select(func.count()).select_from(Expense).where(Expense.is_deleted == False)
        )).scalar_one()

        total_amount = (await self.db.execute(
            select(func.coalesce(func.sum(Expense.amount), 0)).where(Expense.is_deleted == False)
        )).scalar_one()

        new_this_month = (await self.db.execute(
            select(func.count()).select_from(User).where(
                func.date(User.created_at) >= month_start
            )
        )).scalar_one()

        cat_rows = (await self.db.execute(
            select(Expense.category, func.count().label("cnt"))
            .where(Expense.is_deleted == False)
            .group_by(Expense.category)
            .order_by(func.count().desc())
            .limit(5)
        )).all()
        top_categories = [{"category": r.category, "count": r.cnt} for r in cat_rows]

        return AdminStatsResponse(
            total_users=total_users,
            active_today=active_today,
            active_this_week=active_this_week,
            total_expenses_logged=total_expenses,
            total_amount_tracked=float(total_amount),
            new_users_this_month=new_this_month,
            top_categories=top_categories,
        )

    async def list_users(
        self, page: int = 1, per_page: int = 20, search: str = ""
    ) -> AdminUsersResponse:
        from sqlalchemy import or_

        base_filter = None
        if search:
            term = f"%{search}%"
            base_filter = or_(User.name.ilike(term), User.email.ilike(term))

        count_q = select(func.count()).select_from(User)
        if base_filter is not None:
            count_q = count_q.where(base_filter)
        total = (await self.db.execute(count_q)).scalar_one()

        users_q = select(User).order_by(User.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
        if base_filter is not None:
            users_q = users_q.where(base_filter)
        users = (await self.db.execute(users_q)).scalars().all()

        if not users:
            return AdminUsersResponse(items=[], total=total, page=page, per_page=per_page, pages=1)

        user_ids = [u.id for u in users]

        stats_rows = (await self.db.execute(
            select(UserStats).where(UserStats.user_id.in_(user_ids))
        )).scalars().all()
        stats_map = {s.user_id: s for s in stats_rows}

        exp_rows = (await self.db.execute(
            select(Expense.user_id, func.count().label("cnt"))
            .where(Expense.user_id.in_(user_ids), Expense.is_deleted == False)
            .group_by(Expense.user_id)
        )).all()
        exp_map = {r.user_id: r.cnt for r in exp_rows}

        items = [
            AdminUserItem(
                id=str(u.id),
                name=u.name,
                email=u.email,
                college=u.college,
                city=u.city,
                is_active=u.is_active,
                is_admin=u.is_admin,
                onboarding_done=u.onboarding_done,
                total_xp=stats_map[u.id].total_xp if u.id in stats_map else 0,
                current_level=stats_map[u.id].current_level if u.id in stats_map else 1,
                expense_count=exp_map.get(u.id, 0),
                created_at=u.created_at,
                last_login_at=u.last_login_at,
            )
            for u in users
        ]

        return AdminUsersResponse(
            items=items,
            total=total,
            page=page,
            per_page=per_page,
            pages=ceil(total / per_page) if total else 1,
        )

    async def delete_user(self, target_user_id: uuid.UUID, current_admin: User) -> None:
        if target_user_id == current_admin.id:
            raise BadRequestException("Admins cannot delete their own account from here")

        result = await self.db.execute(select(User).where(User.id == target_user_id))
        target = result.scalar_one_or_none()
        if not target:
            raise NotFoundException("User not found")
        if target.is_admin:
            raise BadRequestException("Cannot delete another admin")
        if not target.is_active:
            raise BadRequestException("User is already deleted")

        target.is_active = False
        target.refresh_token = None
        target.email = f"deleted_{target.id}@deleted.invalid"
        await self.db.commit()
        await cache_delete(f"user:{target.id}")
        log.info("admin_deleted_user", admin_id=str(current_admin.id), user_id=str(target.id))

    async def broadcast_notification(self, title: str, message: str, target: str) -> int:
        if target == "inactive":
            week_ago = datetime.now(timezone.utc).date() - timedelta(days=7)
            q = (
                select(User.id)
                .outerjoin(UserStats, UserStats.user_id == User.id)
                .where(
                    User.is_active == True,
                    UserStats.last_active_date < week_ago,
                )
            )
        else:
            q = select(User.id).where(User.is_active == True)

        user_ids = (await self.db.execute(q)).scalars().all()

        for uid in user_ids:
            self.db.add(Notification(
                user_id=uid,
                type="broadcast",
                title=title,
                message=message,
                severity="info",
            ))

        await self.db.commit()
        log.info("broadcast_sent", count=len(user_ids), target=target)
        return len(user_ids)
