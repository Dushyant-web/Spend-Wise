"""
Admin Omniscient Chatbot — full read access to all user data.
Passwords are NEVER included (they are bcrypt hashes and provide zero useful info).
"""
import httpx
import structlog
from datetime import date, timedelta, datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_

from app.config import settings
from app.models.user import User, UserStats
from app.models.expense import Expense
from app.models.budget import Budget
from app.models.achievement import Achievement

log = structlog.get_logger()

ADMIN_SYSTEM = """You are the SpendWise Admin Intelligence — an omniscient assistant for the platform administrator.
You have FULL read access to every user's data: profile, expenses, budgets, achievements, stats, account status.

Capabilities:
- Look up any user by name or email and report their complete financial picture
- Compare users, identify top spenders, highest level users, most active users
- Report platform-wide stats and trends
- Answer questions about achievements, streaks, XP, budgets, expense patterns
- Flag unusual activity (e.g. very high spending, inactive accounts)

Rules:
- Passwords are NEVER shown (they are bcrypt hashes — meaningless and private by design)
- Be precise and data-driven. Cite real numbers from context
- Currency is always ₹ (Indian Rupee)
- If asked about a user not in the context, say they were not found
- Format responses clearly — use bullet points or short paragraphs
- Keep responses concise unless deep detail is requested
- Today's date is provided in context"""


class AdminChatService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _find_user(self, query: str) -> User | None:
        """Try to find a user mentioned in the query by email or name."""
        words = query.lower().split()
        # Check for email pattern
        for word in words:
            if "@" in word:
                email = word.strip(".,;:?!")
                result = await self.db.execute(
                    select(User).where(func.lower(User.email) == email.lower())
                )
                user = result.scalar_one_or_none()
                if user:
                    return user

        # Try name match — look for 2+ consecutive capitalised words
        # Simple approach: try each word and pair of words as a name search
        candidates = []
        for i in range(len(words)):
            term = words[i].strip(".,;:?!")
            if len(term) < 3:
                continue
            result = await self.db.execute(
                select(User).where(
                    or_(
                        User.name.ilike(f"%{term}%"),
                        User.email.ilike(f"%{term}%"),
                    )
                ).limit(3)
            )
            found = result.scalars().all()
            candidates.extend(found)
            if len(candidates) >= 3:
                break

        # Return the first unique candidate
        seen = set()
        for u in candidates:
            if u.id not in seen:
                seen.add(u.id)
                return u
        return None

    async def _build_user_context(self, user: User) -> str:
        today = date.today()
        month_start = today.replace(day=1)
        lines = []

        # Stats
        stats_r = await self.db.execute(
            select(UserStats).where(UserStats.user_id == user.id)
        )
        stats = stats_r.scalar_one_or_none()

        lines.append(f"=== USER PROFILE: {user.name} ===")
        lines.append(f"Email: {user.email}")
        lines.append(f"Phone: {user.phone or 'not set'}")
        lines.append(f"College: {user.college or 'not set'} | City: {user.city or 'not set'}")
        lines.append(f"Monthly income: ₹{user.monthly_income:,.0f}" if user.monthly_income else "Monthly income: not set")
        lines.append(f"Auth provider: {user.auth_provider}")
        lines.append(f"Account status: {'ACTIVE' if user.is_active else 'DEACTIVATED'}")
        lines.append(f"Admin: {'YES' if user.is_admin else 'No'}")
        lines.append(f"Onboarding done: {user.onboarding_done}")
        lines.append(f"Joined: {user.created_at.strftime('%d %b %Y') if user.created_at else 'unknown'}")
        lines.append(f"Last login: {user.last_login_at.strftime('%d %b %Y %H:%M') if user.last_login_at else 'never'}")

        if stats:
            lines.append(f"\n--- GAMIFICATION ---")
            lines.append(f"Level: {stats.current_level} | Total XP: {stats.total_xp}")
            lines.append(f"Current streak: {stats.current_streak} days | Longest: {stats.longest_streak} days")
            lines.append(f"Last active: {stats.last_active_date}")
            lines.append(f"Total saved: ₹{float(stats.total_saved):,.0f}" if stats.total_saved else "Total saved: ₹0")
            lines.append(f"Monthly challenges completed: {stats.monthly_challenges_completed}")

        # Achievements
        ach_r = await self.db.execute(
            select(Achievement).where(Achievement.user_id == user.id).order_by(Achievement.earned_at.desc())
        )
        achievements = ach_r.scalars().all()
        if achievements:
            lines.append(f"\n--- ACHIEVEMENTS ({len(achievements)} total) ---")
            for a in achievements[:10]:
                lines.append(f"  [{a.earned_at.strftime('%d %b %Y')}] {a.badge_name} (+{a.xp_awarded} XP)")
            if len(achievements) > 10:
                lines.append(f"  ... and {len(achievements) - 10} more")

        # This month spending
        cat_r = await self.db.execute(
            select(Expense.category, func.sum(Expense.amount).label("total"), func.count().label("cnt"))
            .where(Expense.user_id == user.id, Expense.expense_date >= month_start,
                   Expense.expense_date <= today, Expense.is_deleted == False)
            .group_by(Expense.category)
            .order_by(func.sum(Expense.amount).desc())
        )
        cat_rows = cat_r.all()

        # Budget
        budget_r = await self.db.execute(
            select(Budget).where(Budget.user_id == user.id, Budget.month == today.month, Budget.year == today.year)
        )
        budget = budget_r.scalar_one_or_none()

        total_this_month = sum(float(r.total) for r in cat_rows)
        lines.append(f"\n--- THIS MONTH ({today.strftime('%B %Y')}) ---")
        if budget:
            pct = int((total_this_month / float(budget.monthly_limit)) * 100) if budget.monthly_limit else 0
            lines.append(f"Budget: ₹{float(budget.monthly_limit):,.0f} | Spent: ₹{total_this_month:,.0f} ({pct}%)")
        else:
            lines.append(f"Total spent: ₹{total_this_month:,.0f} (no budget set)")

        if cat_rows:
            lines.append("By category:")
            for r in cat_rows:
                lines.append(f"  {r.category}: ₹{float(r.total):,.0f} ({r.cnt} txns)")

        # Last 10 transactions
        tx_r = await self.db.execute(
            select(Expense.expense_date, Expense.category, Expense.merchant, Expense.amount, Expense.payment_mode)
            .where(Expense.user_id == user.id, Expense.is_deleted == False)
            .order_by(Expense.expense_date.desc())
            .limit(10)
        )
        recent = tx_r.all()
        if recent:
            lines.append(f"\nLast {len(recent)} transactions:")
            for tx in recent:
                lines.append(f"  {tx.expense_date} | {tx.category} | {tx.merchant or 'Unknown'} | ₹{float(tx.amount):,.0f} | {tx.payment_mode}")

        # All-time total
        total_r = await self.db.execute(
            select(func.sum(Expense.amount), func.count())
            .where(Expense.user_id == user.id, Expense.is_deleted == False)
        )
        total_all, count_all = total_r.one()
        lines.append(f"\nAll-time: {count_all} expenses | ₹{float(total_all or 0):,.0f} total")

        return "\n".join(lines)

    async def _build_platform_context(self) -> str:
        today = date.today()
        week_ago = today - timedelta(days=7)
        month_start = today.replace(day=1)
        lines = []

        total_users = (await self.db.execute(select(func.count()).select_from(User))).scalar_one()
        active_users = (await self.db.execute(select(func.count()).select_from(User).where(User.is_active == True))).scalar_one()
        admin_count = (await self.db.execute(select(func.count()).select_from(User).where(User.is_admin == True))).scalar_one()
        new_month = (await self.db.execute(
            select(func.count()).select_from(User).where(func.date(User.created_at) >= month_start)
        )).scalar_one()
        active_week = (await self.db.execute(
            select(func.count()).select_from(UserStats).where(UserStats.last_active_date >= week_ago)
        )).scalar_one()

        total_expenses = (await self.db.execute(
            select(func.count()).select_from(Expense).where(Expense.is_deleted == False)
        )).scalar_one()
        total_amount = (await self.db.execute(
            select(func.coalesce(func.sum(Expense.amount), 0)).where(Expense.is_deleted == False)
        )).scalar_one()

        top_cats = (await self.db.execute(
            select(Expense.category, func.sum(Expense.amount).label("total"), func.count().label("cnt"))
            .where(Expense.is_deleted == False)
            .group_by(Expense.category)
            .order_by(func.sum(Expense.amount).desc())
            .limit(8)
        )).all()

        # Top 5 users by XP
        top_xp = (await self.db.execute(
            select(User.name, User.email, UserStats.total_xp, UserStats.current_level)
            .join(UserStats, UserStats.user_id == User.id)
            .where(User.is_active == True)
            .order_by(UserStats.total_xp.desc())
            .limit(5)
        )).all()

        # Top 5 spenders this month
        top_spenders = (await self.db.execute(
            select(User.name, User.email, func.sum(Expense.amount).label("total"))
            .join(Expense, Expense.user_id == User.id)
            .where(Expense.expense_date >= month_start, Expense.expense_date <= today, Expense.is_deleted == False)
            .group_by(User.id, User.name, User.email)
            .order_by(func.sum(Expense.amount).desc())
            .limit(5)
        )).all()

        lines.append(f"=== PLATFORM OVERVIEW ({today.strftime('%d %B %Y')}) ===")
        lines.append(f"Total users: {total_users} | Active: {active_users} | Admins: {admin_count}")
        lines.append(f"New this month: {new_month} | Active this week: {active_week}")
        lines.append(f"Total expenses logged: {total_expenses:,} | Total tracked: ₹{float(total_amount):,.0f}")

        if top_cats:
            lines.append("\nTop spending categories (all time):")
            for r in top_cats:
                lines.append(f"  {r.category}: ₹{float(r.total):,.0f} ({r.cnt} txns)")

        if top_xp:
            lines.append("\nTop 5 users by XP:")
            for r in top_xp:
                lines.append(f"  {r.name} ({r.email}) — Level {r.current_level}, {r.total_xp} XP")

        if top_spenders:
            lines.append(f"\nTop spenders this month:")
            for r in top_spenders:
                lines.append(f"  {r.name} ({r.email}) — ₹{float(r.total):,.0f}")

        return "\n".join(lines)

    async def chat(self, message: str, history: list[dict]) -> str:
        if not settings.NVIDIA_API_KEY:
            return "Admin AI is not configured. Add NVIDIA_API_KEY to .env to enable."

        today = date.today()

        # Always include platform context
        platform_ctx = await self._build_platform_context()

        # Check if a specific user is referenced
        user_ctx = ""
        user = await self._find_user(message)
        if user:
            user_ctx = "\n\n" + await self._build_user_context(user)

        full_context = f"Today: {today.strftime('%d %B %Y')}\n\n{platform_ctx}{user_ctx}"
        system = f"{ADMIN_SYSTEM}\n\n{full_context}"

        messages = [{"role": "system", "content": system}]
        for turn in history[-8:]:
            if turn.get("role") in ("user", "assistant") and turn.get("content"):
                messages.append({"role": turn["role"], "content": turn["content"]})
        messages.append({"role": "user", "content": message[:1200]})

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                resp = await client.post(
                    "https://integrate.api.nvidia.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.NVIDIA_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": settings.NVIDIA_MODEL,
                        "messages": messages,
                        "max_tokens": 600,
                        "temperature": 0.4,
                    },
                )
                resp.raise_for_status()
                return resp.json()["choices"][0]["message"]["content"].strip()
        except Exception as e:
            log.warning("admin_chat_error", error=str(e))
            return "Unable to connect to AI right now. Please try again."
