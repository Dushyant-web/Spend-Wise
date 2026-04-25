"""
Achievement engine — checks conditions after each expense and awards badges + XP.
All DB queries are lightweight — no heavy scans.
"""
import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.achievement import Achievement
from app.models.expense import Expense
from app.models.user import UserStats
from app.schemas.achievement import BadgeDefinition, AllBadgesResponse, UserAchievementsResponse, AchievementSchema

import structlog

log = structlog.get_logger()

LEVEL_NAMES = {
    1: "Broke Freshman", 2: "Budget Aware", 3: "Smart Spender",
    4: "Savings Ninja", 5: "Finance Pro", 6: "Money Master",
    7: "Wealth Architect", 8: "Investment Guru", 9: "Financial Legend", 10: "SpendWise God",
}

ALL_BADGES: list[BadgeDefinition] = [
    # Streak
    BadgeDefinition(badge_id="streak_3",     badge_name="Hat Trick",        description="Log expenses 3 days in a row",           emoji="🔥", xp=15,  category="streak",  rarity="common"),
    BadgeDefinition(badge_id="streak_7",     badge_name="Week Warrior",     description="7-day logging streak",                   emoji="⚡", xp=30,  category="streak",  rarity="common"),
    BadgeDefinition(badge_id="streak_30",    badge_name="Month Master",     description="30-day logging streak",                  emoji="🌟", xp=100, category="streak",  rarity="epic"),
    BadgeDefinition(badge_id="streak_100",   badge_name="Century Logger",   description="100-day logging streak",                 emoji="💯", xp=250, category="streak",  rarity="legendary"),
    # Expense count
    BadgeDefinition(badge_id="first_expense",badge_name="First Step",       description="Log your very first expense",            emoji="👣", xp=10,  category="expense", rarity="common"),
    BadgeDefinition(badge_id="exp_10",       badge_name="Getting Started",  description="Log 10 expenses",                       emoji="📝", xp=20,  category="expense", rarity="common"),
    BadgeDefinition(badge_id="exp_50",       badge_name="Regular Tracker",  description="Log 50 expenses",                       emoji="📊", xp=40,  category="expense", rarity="rare"),
    BadgeDefinition(badge_id="exp_100",      badge_name="Century Club",     description="Log 100 expenses",                      emoji="💰", xp=75,  category="expense", rarity="rare"),
    BadgeDefinition(badge_id="exp_500",      badge_name="Power Tracker",    description="Log 500 expenses",                      emoji="🚀", xp=200, category="expense", rarity="epic"),
    # Budget
    BadgeDefinition(badge_id="budget_keeper",badge_name="Budget Keeper",    description="Stay under budget for a full month",     emoji="🎯", xp=50,  category="budget",  rarity="rare"),
    BadgeDefinition(badge_id="budget_3x",    badge_name="Budget Master",    description="Stay under budget 3 months in a row",    emoji="🏆", xp=150, category="budget",  rarity="epic"),
    # Category variety
    BadgeDefinition(badge_id="cat_explorer", badge_name="Category Explorer",description="Use all 10 spending categories",         emoji="🗺️", xp=25,  category="expense", rarity="rare"),
    # Payment mode
    BadgeDefinition(badge_id="upi_master",   badge_name="UPI Master",       description="Make 25 UPI payments",                  emoji="📲", xp=20,  category="expense", rarity="common"),
    BadgeDefinition(badge_id="cashless",     badge_name="Cashless Hero",    description="Entire month with no cash transactions", emoji="💳", xp=30,  category="special", rarity="rare"),
    # Savings
    BadgeDefinition(badge_id="saver_1k",     badge_name="First Save",       description="Save ₹1,000 in a month",                emoji="🐷", xp=25,  category="budget",  rarity="common"),
    BadgeDefinition(badge_id="saver_5k",     badge_name="Super Saver",      description="Save ₹5,000 in a month",                emoji="💎", xp=75,  category="budget",  rarity="epic"),
    # Welcome
    BadgeDefinition(badge_id="welcome",      badge_name="Welcome Aboard",   description="Completed onboarding",                  emoji="🎉", xp=10,  category="special", rarity="common"),
]

BADGE_MAP = {b.badge_id: b for b in ALL_BADGES}


class AchievementService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def check_and_award(self, user_id: uuid.UUID) -> list[str]:
        """Run all checks; return list of newly awarded badge_ids."""
        stats = await self._get_stats(user_id)
        if not stats:
            return []

        already = await self._get_earned_ids(user_id)
        expense_count = await self._expense_count(user_id)
        categories_used = await self._categories_used(user_id)
        upi_count = await self._upi_count(user_id)

        awarded: list[str] = []

        async def _award(badge_id: str):
            if badge_id in already:
                return
            badge = BADGE_MAP.get(badge_id)
            if not badge:
                return
            ach = Achievement(
                user_id=user_id,
                badge_id=badge.badge_id,
                badge_name=badge.badge_name,
                xp_awarded=badge.xp,
            )
            self.db.add(ach)
            stats.total_xp += badge.xp
            stats.current_level = max(1, (stats.total_xp // 100) + 1)
            awarded.append(badge_id)
            log.info("achievement_awarded", user_id=str(user_id), badge=badge_id, xp=badge.xp)

        # Streak badges
        if stats.current_streak >= 3:   await _award("streak_3")
        if stats.current_streak >= 7:   await _award("streak_7")
        if stats.current_streak >= 30:  await _award("streak_30")
        if stats.current_streak >= 100: await _award("streak_100")

        # Expense count badges
        if expense_count >= 1:   await _award("first_expense")
        if expense_count >= 10:  await _award("exp_10")
        if expense_count >= 50:  await _award("exp_50")
        if expense_count >= 100: await _award("exp_100")
        if expense_count >= 500: await _award("exp_500")

        # Category explorer
        if len(categories_used) >= 10: await _award("cat_explorer")

        # UPI master
        if upi_count >= 25: await _award("upi_master")

        if awarded:
            await self.db.commit()

        return awarded

    async def get_user_achievements(self, user_id: uuid.UUID) -> UserAchievementsResponse:
        stats = await self._get_stats(user_id)
        q = select(Achievement).where(
            Achievement.user_id == user_id
        ).order_by(Achievement.earned_at.desc())
        earned = (await self.db.execute(q)).scalars().all()

        total_xp = stats.total_xp if stats else 0
        level = stats.current_level if stats else 1
        streak = stats.current_streak if stats else 0
        longest = stats.longest_streak if stats else 0
        rank = stats.smart_spender_rank if stats else "bronze"
        xp_in_level = total_xp % 100
        xp_to_next = 100 - xp_in_level

        return UserAchievementsResponse(
            earned=[
                AchievementSchema(
                    id=a.badge_id,
                    badge_id=a.badge_id,
                    badge_name=a.badge_name,
                    xp_awarded=a.xp_awarded,
                    earned_at=a.earned_at,
                )
                for a in earned
            ],
            total_xp=total_xp,
            current_level=level,
            current_streak=streak,
            longest_streak=longest,
            xp_to_next_level=xp_to_next,
            level_name=LEVEL_NAMES.get(min(level, 10), "SpendWise God"),
            smart_spender_rank=rank,
        )

    async def get_all_badges(self, user_id: uuid.UUID) -> AllBadgesResponse:
        earned_ids = await self._get_earned_ids(user_id)
        return AllBadgesResponse(badges=ALL_BADGES, earned_ids=list(earned_ids))

    # --- helpers ---

    async def _get_stats(self, user_id: uuid.UUID) -> UserStats | None:
        q = select(UserStats).where(UserStats.user_id == user_id)
        return (await self.db.execute(q)).scalar_one_or_none()

    async def _get_earned_ids(self, user_id: uuid.UUID) -> set[str]:
        q = select(Achievement.badge_id).where(Achievement.user_id == user_id)
        rows = (await self.db.execute(q)).scalars().all()
        return set(rows)

    async def _expense_count(self, user_id: uuid.UUID) -> int:
        q = select(func.count()).select_from(Expense).where(
            Expense.user_id == user_id, Expense.is_deleted == False
        )
        return (await self.db.execute(q)).scalar_one()

    async def _categories_used(self, user_id: uuid.UUID) -> set[str]:
        q = select(Expense.category).where(
            Expense.user_id == user_id, Expense.is_deleted == False
        ).distinct()
        rows = (await self.db.execute(q)).scalars().all()
        return set(rows)

    async def _upi_count(self, user_id: uuid.UUID) -> int:
        q = select(func.count()).select_from(Expense).where(
            Expense.user_id == user_id,
            Expense.is_deleted == False,
            Expense.payment_mode == "upi",
        )
        return (await self.db.execute(q)).scalar_one()
