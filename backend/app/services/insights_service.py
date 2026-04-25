import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserStats
from app.services.analytics_service import AnalyticsService
from app.services.budget_service import BudgetService
from app.services.expense_service import ExpenseService
from app.schemas.analytics import AnalyticsResponse

from sqlalchemy import select
import structlog

log = structlog.get_logger()


class InsightCard:
    def __init__(self, id: str, type: str, title: str, body: str, severity: str = "info", icon: str = "💡"):
        self.id = id
        self.type = type
        self.title = title
        self.body = body
        self.severity = severity
        self.icon = icon

    def dict(self) -> dict:
        return {
            "id": self.id,
            "type": self.type,
            "title": self.title,
            "body": self.body,
            "severity": self.severity,
            "icon": self.icon,
        }


class InsightsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_insights(self, user_id: uuid.UUID) -> list[dict]:
        today = date.today()
        analytics_svc = AnalyticsService(self.db)
        analytics = await analytics_svc.get_full_analytics(user_id)
        stats_q = select(UserStats).where(UserStats.user_id == user_id)
        stats = (await self.db.execute(stats_q)).scalar_one_or_none()

        insights: list[InsightCard] = []
        ov = analytics.overview

        # 1. Budget status
        expense_svc = ExpenseService(self.db)
        budget_svc = BudgetService(self.db)
        try:
            budget = await budget_svc.get_current_budget(user_id, expense_svc)
            if budget.percentage_used >= 100:
                insights.append(InsightCard(
                    id="budget_exceeded",
                    type="budget",
                    title="Budget Exceeded",
                    body=f"You've spent {budget.percentage_used:.0f}% of your ₹{int(float(budget.monthly_limit)):,} budget. Try to avoid non-essential purchases for the rest of the month.",
                    severity="error",
                    icon="🚨",
                ))
            elif budget.percentage_used >= 80:
                remaining = float(budget.remaining_budget)
                days_left = budget.days_in_month - budget.days_elapsed
                daily_budget = remaining / days_left if days_left else 0
                insights.append(InsightCard(
                    id="budget_warning",
                    type="budget",
                    title="Budget Running Low",
                    body=f"You've used {budget.percentage_used:.0f}% of your budget. You have ₹{int(remaining):,} left for {days_left} days (₹{int(daily_budget):,}/day).",
                    severity="warning",
                    icon="⚠️",
                ))
        except Exception:
            insights.append(InsightCard(
                id="no_budget",
                type="budget",
                title="Set a Budget",
                body="You haven't set a budget for this month yet. Setting one helps you stay in control of your spending.",
                severity="info",
                icon="🎯",
            ))

        # 2. Spending trend vs last month
        if ov.compared_to_last_month > 20:
            insights.append(InsightCard(
                id="spending_up",
                type="trend",
                title="Spending Spike",
                body=f"You're spending {ov.compared_to_last_month:.0f}% more than last month. Your top category this month is {ov.top_category}.",
                severity="warning",
                icon="📈",
            ))
        elif ov.compared_to_last_month < -10:
            insights.append(InsightCard(
                id="spending_down",
                type="trend",
                title="Great Savings!",
                body=f"You're spending {abs(ov.compared_to_last_month):.0f}% less than last month. Keep it up! 🎉",
                severity="success",
                icon="📉",
            ))

        # 3. Top category insight
        if analytics.category_breakdown:
            top = analytics.category_breakdown[0]
            if top.percentage > 40:
                insights.append(InsightCard(
                    id="top_category",
                    type="category",
                    title=f"Heavy {top.category.title()} Spending",
                    body=f"{top.emoji} {top.category.title()} accounts for {top.percentage:.0f}% of your total spending (₹{int(top.amount):,}). Consider setting a category limit.",
                    severity="warning",
                    icon=top.emoji,
                ))

        # 4. Projection warning
        if ov.projected_monthly > 0:
            insights.append(InsightCard(
                id="projection",
                type="projection",
                title="Month-End Projection",
                body=f"At your current rate (₹{int(ov.avg_per_day):,}/day), you'll spend approximately ₹{int(ov.projected_monthly):,} by end of month.",
                severity="info",
                icon="🔮",
            ))

        # 5. Streak motivation
        if stats:
            if stats.current_streak >= 7:
                insights.append(InsightCard(
                    id="streak",
                    type="gamification",
                    title=f"🔥 {stats.current_streak}-Day Streak!",
                    body=f"You've been logging expenses for {stats.current_streak} days straight. You're at Level {stats.current_level} with {stats.total_xp} XP. Keep going!",
                    severity="success",
                    icon="🔥",
                ))
            elif stats.current_streak == 0:
                insights.append(InsightCard(
                    id="start_streak",
                    type="gamification",
                    title="Start Your Streak",
                    body="Log an expense today to start building your streak! Daily logging earns you bonus XP.",
                    severity="info",
                    icon="⚡",
                ))

        # 6. Payment mode tip
        if analytics.payment_modes:
            cash_mode = next((m for m in analytics.payment_modes if m.mode == "cash"), None)
            if cash_mode and cash_mode.percentage > 30:
                insights.append(InsightCard(
                    id="cash_heavy",
                    type="tip",
                    title="High Cash Usage",
                    body=f"{cash_mode.percentage:.0f}% of your spending is in cash. Switching to UPI makes it easier to track every rupee automatically.",
                    severity="info",
                    icon="💡",
                ))

        return [i.dict() for i in insights[:6]]
