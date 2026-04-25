import uuid
from calendar import monthrange
from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import select, func, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.expense import Expense
from app.models.budget import Budget
from app.redis_client import cache_set, cache_get
from app.schemas.analytics import (
    AnalyticsResponse,
    CategoryBreakdownItem,
    MonthlyTrendItem,
    DailySpendingItem,
    TopMerchantItem,
    PaymentModeItem,
    OverviewResponse,
)

import structlog

log = structlog.get_logger()

CATEGORY_EMOJI = {
    "food": "🍽️",
    "transport": "🚌",
    "shopping": "🛍️",
    "entertainment": "🎮",
    "bills": "💡",
    "education": "📚",
    "rent": "🏠",
    "subscriptions": "📱",
    "emergency": "🚨",
    "miscellaneous": "📦",
}

MONTH_LABELS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]


class AnalyticsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_full_analytics(self, user_id: uuid.UUID) -> AnalyticsResponse:
        today = date.today()
        month, year = today.month, today.year

        cache_key = f"analytics:{user_id}:{year}:{month}:full"
        cached = await cache_get(cache_key)
        if cached:
            return AnalyticsResponse(**cached)

        overview = await self._get_overview(user_id, month, year, today)
        category_breakdown = await self._get_category_breakdown(user_id, month, year)
        monthly_trend = await self._get_monthly_trend(user_id, month, year)
        daily_spending = await self._get_daily_spending(user_id, month, year)
        top_merchants = await self._get_top_merchants(user_id, month, year)
        payment_modes = await self._get_payment_modes(user_id, month, year)

        result = AnalyticsResponse(
            overview=overview,
            category_breakdown=category_breakdown,
            monthly_trend=monthly_trend,
            daily_spending=daily_spending,
            top_merchants=top_merchants,
            payment_modes=payment_modes,
        )
        await cache_set(cache_key, result.model_dump(), ttl=300)
        return result

    async def _get_overview(
        self, user_id: uuid.UUID, month: int, year: int, today: date
    ) -> OverviewResponse:
        days_in_month = monthrange(year, month)[1]
        days_elapsed = today.day

        total_q = select(
            func.coalesce(func.sum(Expense.amount), 0),
            func.count(Expense.id),
        ).where(
            Expense.user_id == user_id,
            Expense.is_deleted == False,
            func.extract("month", Expense.expense_date) == month,
            func.extract("year", Expense.expense_date) == year,
        )
        total_row = (await self.db.execute(total_q)).one()
        total_spent = float(total_row[0])
        tx_count = int(total_row[1])

        # Last month total for comparison
        last_month = month - 1 if month > 1 else 12
        last_year = year if month > 1 else year - 1
        last_q = select(func.coalesce(func.sum(Expense.amount), 0)).where(
            Expense.user_id == user_id,
            Expense.is_deleted == False,
            func.extract("month", Expense.expense_date) == last_month,
            func.extract("year", Expense.expense_date) == last_year,
        )
        last_total = float((await self.db.execute(last_q)).scalar_one())

        compared = ((total_spent - last_total) / last_total * 100) if last_total else 0

        # Top category
        top_cat_q = (
            select(Expense.category, func.sum(Expense.amount).label("total"))
            .where(
                Expense.user_id == user_id,
                Expense.is_deleted == False,
                func.extract("month", Expense.expense_date) == month,
                func.extract("year", Expense.expense_date) == year,
            )
            .group_by(Expense.category)
            .order_by(desc("total"))
            .limit(1)
        )
        top_cat_row = (await self.db.execute(top_cat_q)).one_or_none()

        daily_avg = total_spent / days_elapsed if days_elapsed else 0
        projected = daily_avg * days_in_month

        return OverviewResponse(
            total_spent=round(total_spent, 2),
            transaction_count=tx_count,
            avg_per_transaction=round(total_spent / tx_count, 2) if tx_count else 0,
            avg_per_day=round(daily_avg, 2),
            top_category=top_cat_row.category if top_cat_row else None,
            top_category_amount=float(top_cat_row.total) if top_cat_row else 0,
            compared_to_last_month=round(compared, 1),
            projected_monthly=round(projected, 2),
            days_elapsed=days_elapsed,
            days_in_month=days_in_month,
        )

    async def _get_category_breakdown(
        self, user_id: uuid.UUID, month: int, year: int
    ) -> list[CategoryBreakdownItem]:
        q = (
            select(
                Expense.category,
                func.sum(Expense.amount).label("total"),
                func.count(Expense.id).label("cnt"),
            )
            .where(
                Expense.user_id == user_id,
                Expense.is_deleted == False,
                func.extract("month", Expense.expense_date) == month,
                func.extract("year", Expense.expense_date) == year,
            )
            .group_by(Expense.category)
            .order_by(desc("total"))
        )
        rows = (await self.db.execute(q)).all()
        grand_total = sum(float(r.total) for r in rows) or 1

        return [
            CategoryBreakdownItem(
                category=r.category,
                amount=round(float(r.total), 2),
                percentage=round(float(r.total) / grand_total * 100, 1),
                count=int(r.cnt),
                emoji=CATEGORY_EMOJI.get(r.category, "💰"),
            )
            for r in rows
        ]

    async def _get_monthly_trend(
        self, user_id: uuid.UUID, current_month: int, current_year: int
    ) -> list[MonthlyTrendItem]:
        items = []
        for i in range(5, -1, -1):
            m = current_month - i
            y = current_year
            while m <= 0:
                m += 12
                y -= 1

            total_q = select(
                func.coalesce(func.sum(Expense.amount), 0),
                func.count(Expense.id),
            ).where(
                Expense.user_id == user_id,
                Expense.is_deleted == False,
                func.extract("month", Expense.expense_date) == m,
                func.extract("year", Expense.expense_date) == y,
            )
            row = (await self.db.execute(total_q)).one()

            budget_q = select(Budget.monthly_limit).where(
                Budget.user_id == user_id,
                Budget.month == m,
                Budget.year == y,
            )
            budget_limit = (await self.db.execute(budget_q)).scalar_one_or_none()

            items.append(
                MonthlyTrendItem(
                    month=m,
                    year=y,
                    label=f"{MONTH_LABELS[m - 1]} '{str(y)[2:]}",
                    total=round(float(row[0]), 2),
                    budget=float(budget_limit) if budget_limit else None,
                    count=int(row[1]),
                )
            )
        return items

    async def _get_daily_spending(
        self, user_id: uuid.UUID, month: int, year: int
    ) -> list[DailySpendingItem]:
        q = (
            select(
                func.extract("day", Expense.expense_date).label("day"),
                func.sum(Expense.amount).label("total"),
            )
            .where(
                Expense.user_id == user_id,
                Expense.is_deleted == False,
                func.extract("month", Expense.expense_date) == month,
                func.extract("year", Expense.expense_date) == year,
            )
            .group_by("day")
            .order_by("day")
        )
        rows = (await self.db.execute(q)).all()
        day_map = {int(r.day): float(r.total) for r in rows}

        days_in_month = monthrange(year, month)[1]
        today = date.today()
        max_day = today.day if (today.month == month and today.year == year) else days_in_month

        result = []
        cumulative = 0.0
        for d in range(1, max_day + 1):
            amt = day_map.get(d, 0.0)
            cumulative += amt
            result.append(
                DailySpendingItem(
                    day=d,
                    date=f"{year}-{month:02d}-{d:02d}",
                    amount=round(amt, 2),
                    cumulative=round(cumulative, 2),
                )
            )
        return result

    async def _get_top_merchants(
        self, user_id: uuid.UUID, month: int, year: int, limit: int = 5
    ) -> list[TopMerchantItem]:
        q = (
            select(
                Expense.merchant,
                Expense.category,
                func.sum(Expense.amount).label("total"),
                func.count(Expense.id).label("cnt"),
            )
            .where(
                Expense.user_id == user_id,
                Expense.is_deleted == False,
                Expense.merchant != None,
                func.extract("month", Expense.expense_date) == month,
                func.extract("year", Expense.expense_date) == year,
            )
            .group_by(Expense.merchant, Expense.category)
            .order_by(desc("total"))
            .limit(limit)
        )
        rows = (await self.db.execute(q)).all()
        return [
            TopMerchantItem(
                merchant=r.merchant,
                amount=round(float(r.total), 2),
                count=int(r.cnt),
                category=r.category,
            )
            for r in rows
        ]

    async def _get_payment_modes(
        self, user_id: uuid.UUID, month: int, year: int
    ) -> list[PaymentModeItem]:
        q = (
            select(
                Expense.payment_mode,
                func.sum(Expense.amount).label("total"),
                func.count(Expense.id).label("cnt"),
            )
            .where(
                Expense.user_id == user_id,
                Expense.is_deleted == False,
                func.extract("month", Expense.expense_date) == month,
                func.extract("year", Expense.expense_date) == year,
            )
            .group_by(Expense.payment_mode)
            .order_by(desc("total"))
        )
        rows = (await self.db.execute(q)).all()
        grand_total = sum(float(r.total) for r in rows) or 1

        return [
            PaymentModeItem(
                mode=r.payment_mode,
                amount=round(float(r.total), 2),
                count=int(r.cnt),
                percentage=round(float(r.total) / grand_total * 100, 1),
            )
            for r in rows
        ]
