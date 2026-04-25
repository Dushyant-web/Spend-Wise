"""
Authenticated AI Coach — answers personal finance questions grounded in the
user's actual spending data. Uses NVIDIA NIM (OpenAI-compatible endpoint).
"""
import httpx
import structlog
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import date, timedelta

from app.config import settings
from app.models.expense import Expense
from app.models.budget import Budget
from app.models.user import UserStats

log = structlog.get_logger()

COACH_SYSTEM = """You are SpendWise AI Coach, a personal finance assistant for Indian college students.
You have access to the user's REAL spending data (provided below). Use it to give specific, actionable answers.

Rules:
- Always cite numbers from the data when relevant (e.g. "Your food spend is ₹3,200 this month")
- Keep answers concise: 3-5 sentences max unless the user asks for detail
- Speak like a smart, supportive friend — not a bank advisor
- Currency is always ₹ (Indian Rupee)
- If the data doesn't have enough info to answer, say so honestly
- Never make up numbers not in the context"""


class AICoachService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _build_context(self, user_id: str) -> str:
        today = date.today()
        month_start = today.replace(day=1)

        # Current month expenses
        result = await self.db.execute(
            select(
                Expense.category,
                func.sum(Expense.amount).label("total"),
                func.count().label("count"),
            )
            .where(
                Expense.user_id == user_id,
                Expense.expense_date >= month_start,
                Expense.expense_date <= today,
            )
            .group_by(Expense.category)
        )
        category_rows = result.all()

        # Last 5 transactions
        tx_result = await self.db.execute(
            select(Expense.merchant, Expense.amount, Expense.category, Expense.expense_date)
            .where(Expense.user_id == user_id)
            .order_by(Expense.expense_date.desc())
            .limit(5)
        )
        recent = tx_result.all()

        # Budget
        budget_result = await self.db.execute(
            select(Budget).where(
                Budget.user_id == user_id,
                Budget.month == today.month,
                Budget.year == today.year,
            )
        )
        budget = budget_result.scalar_one_or_none()

        # User stats
        stats_result = await self.db.execute(
            select(UserStats).where(UserStats.user_id == user_id)
        )
        stats = stats_result.scalar_one_or_none()

        lines = [f"=== USER FINANCIAL CONTEXT ({today.strftime('%B %Y')}) ==="]

        if budget:
            total_spent = sum(float(r.total) for r in category_rows)
            remaining = float(budget.monthly_limit) - total_spent
            pct = int((total_spent / float(budget.monthly_limit)) * 100) if budget.monthly_limit else 0
            lines.append(f"Monthly budget: ₹{budget.monthly_limit:,.0f}")
            lines.append(f"Spent so far: ₹{total_spent:,.0f} ({pct}% of budget)")
            lines.append(f"Remaining: ₹{remaining:,.0f}")
        else:
            total_spent = sum(float(r.total) for r in category_rows)
            lines.append(f"Spent this month: ₹{total_spent:,.0f} (no budget set)")

        if category_rows:
            lines.append("\nSpending by category this month:")
            for row in sorted(category_rows, key=lambda r: r.total, reverse=True):
                lines.append(f"  {row.category}: ₹{float(row.total):,.0f} ({row.count} transactions)")

        if recent:
            lines.append("\nLast 5 transactions:")
            for tx in recent:
                lines.append(f"  {tx.expense_date} | {tx.category} | {tx.merchant or 'Unknown'} | ₹{float(tx.amount):,.0f}")

        if stats:
            lines.append(f"\nStreak: {stats.current_streak} days | Level: {stats.current_level} | XP: {stats.total_xp}")

        lines.append(f"\nDays elapsed in month: {today.day} of ~30")

        return "\n".join(lines)

    async def chat(
        self,
        user_id: str,
        message: str,
        history: list[dict],
    ) -> str:
        if not settings.NVIDIA_API_KEY:
            return "AI Coach is not configured. Add NVIDIA_API_KEY to your .env to enable this feature."

        context = await self._build_context(user_id)
        system_with_context = f"{COACH_SYSTEM}\n\n{context}"

        messages = [{"role": "system", "content": system_with_context}]
        # Include last 6 turns of history for context
        for turn in history[-6:]:
            if turn.get("role") in ("user", "assistant") and turn.get("content"):
                messages.append({"role": turn["role"], "content": turn["content"]})
        messages.append({"role": "user", "content": message[:800]})

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    "https://integrate.api.nvidia.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.NVIDIA_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": settings.NVIDIA_MODEL,
                        "messages": messages,
                        "max_tokens": 400,
                        "temperature": 0.6,
                    },
                )
                resp.raise_for_status()
                return resp.json()["choices"][0]["message"]["content"].strip()
        except Exception as e:
            log.warning("ai_coach_error", error=str(e))
            return "I'm having trouble connecting right now. Please try again in a moment."
