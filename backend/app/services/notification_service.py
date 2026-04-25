import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification
from app.schemas.notification import NotificationListResponse, NotificationSchema

import structlog

log = structlog.get_logger()


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_notifications(
        self, user_id: uuid.UUID, limit: int = 20
    ) -> NotificationListResponse:
        q = (
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .limit(limit)
        )
        items = (await self.db.execute(q)).scalars().all()

        unread_q = select(func.count()).select_from(Notification).where(
            Notification.user_id == user_id,
            Notification.is_seen == False,
        )
        unread = (await self.db.execute(unread_q)).scalar_one()

        return NotificationListResponse(
            items=[NotificationSchema.model_validate(n) for n in items],
            unread_count=unread,
        )

    async def mark_read(self, user_id: uuid.UUID, notification_id: uuid.UUID) -> None:
        await self.db.execute(
            update(Notification)
            .where(Notification.id == notification_id, Notification.user_id == user_id)
            .values(is_seen=True)
        )
        await self.db.commit()

    async def mark_all_read(self, user_id: uuid.UUID) -> None:
        await self.db.execute(
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_seen == False)
            .values(is_seen=True)
        )
        await self.db.commit()

    async def create(
        self,
        user_id: uuid.UUID,
        type: str,
        title: str,
        message: str,
        severity: str = "info",
        data: dict | None = None,
    ) -> Notification:
        n = Notification(
            user_id=user_id,
            type=type,
            title=title,
            message=message,
            severity=severity,
            data=data or {},
        )
        self.db.add(n)
        await self.db.commit()
        await self.db.refresh(n)
        return n

    async def check_budget_alerts(
        self,
        user_id: uuid.UUID,
        budget_limit: Decimal,
        spending_so_far: Decimal,
        month: int,
        year: int,
    ) -> None:
        pct = float(spending_so_far / budget_limit * 100) if budget_limit else 0

        dedup_key_80 = f"budget_alert_80_{user_id}_{month}_{year}"
        dedup_key_100 = f"budget_alert_100_{user_id}_{month}_{year}"

        existing_q = select(Notification.type, Notification.data).where(
            Notification.user_id == user_id,
            Notification.type.in_(["budget_warning", "budget_exceeded"]),
        )
        existing = (await self.db.execute(existing_q)).all()
        existing_types = {
            (r.type, r.data.get("month"), r.data.get("year")) for r in existing
        }

        if pct >= 100 and ("budget_exceeded", month, year) not in existing_types:
            await self.create(
                user_id=user_id,
                type="budget_exceeded",
                title="Budget Exceeded! 🚨",
                message=f"You've spent ₹{int(spending_so_far):,} — your entire budget for this month.",
                severity="error",
                data={"month": month, "year": year, "percentage": round(pct, 1)},
            )
            log.info("budget_exceeded_alert", user_id=str(user_id))
        elif pct >= 80 and ("budget_warning", month, year) not in existing_types:
            remaining = float(budget_limit - spending_so_far)
            await self.create(
                user_id=user_id,
                type="budget_warning",
                title="Budget Alert ⚠️",
                message=f"You've used {pct:.0f}% of your budget. ₹{int(remaining):,} remaining.",
                severity="warning",
                data={"month": month, "year": year, "percentage": round(pct, 1)},
            )
            log.info("budget_warning_alert", user_id=str(user_id))
