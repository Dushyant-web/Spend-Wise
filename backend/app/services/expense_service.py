import csv
import io
import uuid
from datetime import date, datetime
from decimal import Decimal
from math import ceil
from typing import Optional

from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException, BadRequestException
from app.models.expense import Expense
from app.models.budget import Budget
from app.models.user import UserStats
from app.redis_client import cache_delete_pattern, cache_set, cache_get
from app.schemas.expense import (
    ExpenseCreate, ExpenseUpdate, PaginatedExpenseResponse,
    ExpenseSchema, ImportCSVResponse, CategoryEnum, PaymentModeEnum,
)

import structlog

log = structlog.get_logger()

XP_PER_EXPENSE = 5


class ExpenseService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_expense(
        self, user_id: uuid.UUID, data: ExpenseCreate, check_budget: bool = True
    ) -> Expense:
        expense = Expense(
            user_id=user_id,
            amount=data.amount,
            category=data.category.value,
            subcategory=data.subcategory,
            merchant=data.merchant,
            note=data.note,
            payment_mode=data.payment_mode.value,
            source="manual",
            tags=data.tags,
            is_recurring=data.is_recurring,
            expense_date=data.expense_date or date.today(),
        )
        self.db.add(expense)
        await self.db.flush()

        await self._award_xp(user_id, XP_PER_EXPENSE)
        await self.db.commit()
        await self.db.refresh(expense)

        await cache_delete_pattern(f"analytics:{user_id}:*")
        await cache_delete_pattern(f"budget:{user_id}:*")

        if check_budget:
            await self._fire_budget_alerts(user_id, expense.expense_date)

        await self._check_achievements(user_id)

        log.info("expense_created", user_id=str(user_id), expense_id=str(expense.id), amount=str(data.amount))
        return expense

    async def list_expenses(
        self,
        user_id: uuid.UUID,
        page: int = 1,
        per_page: int = 20,
        category: Optional[str] = None,
        payment_mode: Optional[str] = None,
        search: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        month: Optional[int] = None,
        year: Optional[int] = None,
    ) -> PaginatedExpenseResponse:
        filters = [
            Expense.user_id == user_id,
            Expense.is_deleted == False,
        ]

        if category:
            filters.append(Expense.category == category)
        if payment_mode:
            filters.append(Expense.payment_mode == payment_mode)
        if search:
            term = f"%{search}%"
            filters.append(
                or_(
                    Expense.merchant.ilike(term),
                    Expense.note.ilike(term),
                    Expense.subcategory.ilike(term),
                )
            )
        if date_from:
            filters.append(Expense.expense_date >= date_from)
        if date_to:
            filters.append(Expense.expense_date <= date_to)
        if month:
            filters.append(func.extract("month", Expense.expense_date) == month)
        if year:
            filters.append(func.extract("year", Expense.expense_date) == year)

        count_q = select(func.count()).select_from(Expense).where(and_(*filters))
        total = (await self.db.execute(count_q)).scalar_one()

        offset = (page - 1) * per_page
        q = (
            select(Expense)
            .where(and_(*filters))
            .order_by(desc(Expense.expense_date), desc(Expense.created_at))
            .offset(offset)
            .limit(per_page)
        )
        rows = (await self.db.execute(q)).scalars().all()

        return PaginatedExpenseResponse(
            items=[ExpenseSchema.model_validate(e) for e in rows],
            total=total,
            page=page,
            per_page=per_page,
            pages=ceil(total / per_page) if total else 1,
        )

    async def get_expense(self, user_id: uuid.UUID, expense_id: uuid.UUID) -> Expense:
        q = select(Expense).where(
            Expense.id == expense_id,
            Expense.user_id == user_id,
            Expense.is_deleted == False,
        )
        expense = (await self.db.execute(q)).scalar_one_or_none()
        if not expense:
            raise NotFoundException("Expense not found")
        return expense

    async def update_expense(
        self, user_id: uuid.UUID, expense_id: uuid.UUID, data: ExpenseUpdate
    ) -> Expense:
        expense = await self.get_expense(user_id, expense_id)

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field == "category" and value is not None:
                value = value.value
            if field == "payment_mode" and value is not None:
                value = value.value
            setattr(expense, field, value)

        await self.db.commit()
        await self.db.refresh(expense)

        await cache_delete_pattern(f"analytics:{user_id}:*")
        await cache_delete_pattern(f"budget:{user_id}:*")

        return expense

    async def delete_expense(self, user_id: uuid.UUID, expense_id: uuid.UUID) -> None:
        expense = await self.get_expense(user_id, expense_id)
        expense.is_deleted = True
        await self.db.commit()

        await cache_delete_pattern(f"analytics:{user_id}:*")
        await cache_delete_pattern(f"budget:{user_id}:*")

    async def get_monthly_total(self, user_id: uuid.UUID, month: int, year: int) -> Decimal:
        q = select(func.coalesce(func.sum(Expense.amount), 0)).where(
            Expense.user_id == user_id,
            Expense.is_deleted == False,
            func.extract("month", Expense.expense_date) == month,
            func.extract("year", Expense.expense_date) == year,
        )
        result = (await self.db.execute(q)).scalar_one()
        return Decimal(str(result))

    async def get_category_totals(
        self, user_id: uuid.UUID, month: int, year: int
    ) -> dict[str, float]:
        q = (
            select(Expense.category, func.sum(Expense.amount).label("total"))
            .where(
                Expense.user_id == user_id,
                Expense.is_deleted == False,
                func.extract("month", Expense.expense_date) == month,
                func.extract("year", Expense.expense_date) == year,
            )
            .group_by(Expense.category)
        )
        rows = (await self.db.execute(q)).all()
        return {row.category: float(row.total) for row in rows}

    async def export_csv(self, user_id: uuid.UUID) -> str:
        q = (
            select(Expense)
            .where(Expense.user_id == user_id, Expense.is_deleted == False)
            .order_by(desc(Expense.expense_date), desc(Expense.created_at))
        )
        rows = (await self.db.execute(q)).scalars().all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "date", "amount", "category", "subcategory",
            "merchant", "note", "payment_mode", "tags",
        ])
        for e in rows:
            writer.writerow([
                e.expense_date.isoformat(),
                str(e.amount),
                e.category,
                e.subcategory or "",
                e.merchant or "",
                e.note or "",
                e.payment_mode,
                ",".join(e.tags) if e.tags else "",
            ])
        return output.getvalue()

    async def import_csv(self, user_id: uuid.UUID, csv_content: str) -> ImportCSVResponse:
        reader = csv.DictReader(io.StringIO(csv_content))
        imported = 0
        skipped = 0
        errors: list[str] = []

        valid_categories = {e.value for e in CategoryEnum}
        valid_modes = {e.value for e in PaymentModeEnum}

        for i, row in enumerate(reader, start=2):
            try:
                category = row.get("category", "").strip().lower()
                if category not in valid_categories:
                    errors.append(f"Row {i}: invalid category '{category}'")
                    skipped += 1
                    continue

                amount_str = row.get("amount", "").strip()
                try:
                    amount = Decimal(amount_str)
                    if amount <= 0:
                        raise ValueError
                except Exception:
                    errors.append(f"Row {i}: invalid amount '{amount_str}'")
                    skipped += 1
                    continue

                mode = row.get("payment_mode", "upi").strip().lower()
                if mode not in valid_modes:
                    mode = "upi"

                date_str = row.get("date", "").strip()
                try:
                    exp_date = date.fromisoformat(date_str) if date_str else date.today()
                except ValueError:
                    exp_date = date.today()

                tags_raw = row.get("tags", "").strip()
                tags = [t.strip() for t in tags_raw.split(",") if t.strip()] or None

                expense = Expense(
                    user_id=user_id,
                    amount=amount,
                    category=category,
                    subcategory=row.get("subcategory", "").strip() or None,
                    merchant=row.get("merchant", "").strip() or None,
                    note=row.get("note", "").strip() or None,
                    payment_mode=mode,
                    source="csv",
                    tags=tags,
                    expense_date=exp_date,
                )
                self.db.add(expense)
                imported += 1

            except Exception as e:
                errors.append(f"Row {i}: {str(e)}")
                skipped += 1

        if imported:
            await self.db.commit()
            await cache_delete_pattern(f"analytics:{user_id}:*")
            await cache_delete_pattern(f"budget:{user_id}:*")

        return ImportCSVResponse(imported=imported, skipped=skipped, errors=errors[:20])

    async def _check_achievements(self, user_id: uuid.UUID) -> None:
        try:
            from app.services.achievement_service import AchievementService
            svc = AchievementService(self.db)
            await svc.check_and_award(user_id)
        except Exception as e:
            log.warning("achievement_check_failed", user_id=str(user_id), error=str(e))

    async def _fire_budget_alerts(self, user_id: uuid.UUID, expense_date: date) -> None:
        from app.services.notification_service import NotificationService
        budget_q = select(Budget).where(
            Budget.user_id == user_id,
            Budget.month == expense_date.month,
            Budget.year == expense_date.year,
        )
        budget = (await self.db.execute(budget_q)).scalar_one_or_none()
        if not budget:
            return
        total = await self.get_monthly_total(user_id, expense_date.month, expense_date.year)
        notif_svc = NotificationService(self.db)
        await notif_svc.check_budget_alerts(
            user_id, budget.monthly_limit, total, expense_date.month, expense_date.year
        )

    async def _award_xp(self, user_id: uuid.UUID, xp: int) -> None:
        q = select(UserStats).where(UserStats.user_id == user_id)
        stats = (await self.db.execute(q)).scalar_one_or_none()
        if stats:
            stats.total_xp += xp
            stats.current_level = max(1, (stats.total_xp // 100) + 1)
            today = date.today()
            if stats.last_active_date != today:
                if stats.last_active_date and (today - stats.last_active_date).days == 1:
                    stats.current_streak += 1
                    if stats.current_streak > stats.longest_streak:
                        stats.longest_streak = stats.current_streak
                else:
                    stats.current_streak = 1
                stats.last_active_date = today
