import uuid
from calendar import monthrange
from datetime import date
from decimal import Decimal
from typing import Optional

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException, ConflictException
from app.models.budget import Budget
from app.redis_client import cache_set, cache_get, cache_delete_pattern
from app.schemas.budget import (
    BudgetCreate,
    BudgetUpdate,
    BudgetWithSpendingSchema,
    BudgetHistoryItem,
    CategorySpendingSchema,
)

import structlog

log = structlog.get_logger()


class BudgetService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def set_budget(self, user_id: uuid.UUID, data: BudgetCreate) -> Budget:
        today = date.today()
        month, year = today.month, today.year

        existing = await self._get_budget_for_month(user_id, month, year)
        if existing:
            raise ConflictException("Budget for this month already exists. Use PUT to update.")

        budget = Budget(
            user_id=user_id,
            month=month,
            year=year,
            monthly_limit=data.monthly_limit,
            category_limits=data.category_limits,
            savings_goal=data.savings_goal or Decimal("0"),
            rollover_enabled=data.rollover_enabled,
        )
        self.db.add(budget)
        await self.db.commit()
        await self.db.refresh(budget)

        await cache_delete_pattern(f"budget:{user_id}:*")
        log.info("budget_created", user_id=str(user_id), month=month, year=year)
        return budget

    async def get_current_budget(
        self, user_id: uuid.UUID, expense_service
    ) -> BudgetWithSpendingSchema:
        today = date.today()
        month, year = today.month, today.year

        cache_key = f"budget:{user_id}:{year}:{month}"
        cached = await cache_get(cache_key)
        if cached:
            return BudgetWithSpendingSchema(**cached)

        budget = await self._get_budget_for_month(user_id, month, year)
        if not budget:
            raise NotFoundException("No budget set for this month")

        spending_total = await expense_service.get_monthly_total(user_id, month, year)
        category_totals = await expense_service.get_category_totals(user_id, month, year)

        days_in_month = monthrange(year, month)[1]
        days_elapsed = today.day
        remaining = budget.monthly_limit - spending_total
        percentage_used = float(spending_total / budget.monthly_limit * 100) if budget.monthly_limit else 0
        daily_avg = float(spending_total / days_elapsed) if days_elapsed else 0

        category_spending: list[CategorySpendingSchema] = []
        for cat, limit in (budget.category_limits or {}).items():
            spent = category_totals.get(cat, 0.0)
            category_spending.append(
                CategorySpendingSchema(
                    category=cat,
                    budget=limit,
                    spent=spent,
                    remaining=limit - spent,
                    percentage=round(spent / limit * 100, 1) if limit else 0,
                )
            )
        for cat, spent in category_totals.items():
            if cat not in (budget.category_limits or {}):
                category_spending.append(
                    CategorySpendingSchema(
                        category=cat,
                        budget=0.0,
                        spent=spent,
                        remaining=-spent,
                        percentage=100.0,
                    )
                )

        result = BudgetWithSpendingSchema(
            id=budget.id,
            user_id=budget.user_id,
            month=budget.month,
            year=budget.year,
            monthly_limit=budget.monthly_limit,
            category_limits=budget.category_limits or {},
            rollover_enabled=budget.rollover_enabled,
            savings_goal=budget.savings_goal,
            created_at=budget.created_at,
            updated_at=budget.updated_at,
            spending_so_far=spending_total,
            remaining_budget=remaining,
            percentage_used=round(percentage_used, 1),
            daily_average=round(daily_avg, 2),
            days_elapsed=days_elapsed,
            days_in_month=days_in_month,
            category_spending=category_spending,
        )

        await cache_set(cache_key, result.model_dump(mode="json"), ttl=300)
        return result

    async def update_budget(
        self, user_id: uuid.UUID, data: BudgetUpdate
    ) -> Budget:
        today = date.today()
        budget = await self._get_budget_for_month(user_id, today.month, today.year)
        if not budget:
            raise NotFoundException("No budget set for this month")

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(budget, field, value)

        await self.db.commit()
        await self.db.refresh(budget)
        await cache_delete_pattern(f"budget:{user_id}:*")
        return budget

    async def get_budget_history(
        self, user_id: uuid.UUID, expense_service, limit: int = 6
    ) -> list[BudgetHistoryItem]:
        q = (
            select(Budget)
            .where(Budget.user_id == user_id)
            .order_by(desc(Budget.year), desc(Budget.month))
            .limit(limit)
        )
        budgets = (await self.db.execute(q)).scalars().all()

        history = []
        for b in budgets:
            actual = await expense_service.get_monthly_total(user_id, b.month, b.year)
            pct = float(actual / b.monthly_limit * 100) if b.monthly_limit else 0
            history.append(
                BudgetHistoryItem(
                    id=b.id,
                    user_id=b.user_id,
                    month=b.month,
                    year=b.year,
                    monthly_limit=b.monthly_limit,
                    category_limits=b.category_limits or {},
                    rollover_enabled=b.rollover_enabled,
                    savings_goal=b.savings_goal,
                    created_at=b.created_at,
                    updated_at=b.updated_at,
                    actual_spending=float(actual),
                    percentage_used=round(pct, 1),
                )
            )
        return history

    async def _get_budget_for_month(
        self, user_id: uuid.UUID, month: int, year: int
    ) -> Optional[Budget]:
        q = select(Budget).where(
            Budget.user_id == user_id,
            Budget.month == month,
            Budget.year == year,
        )
        return (await self.db.execute(q)).scalar_one_or_none()
