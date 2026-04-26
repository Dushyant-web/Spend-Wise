"""
Admin Omniscient Chatbot — full read access to all user data + action tools.
Passwords are NEVER included (they are bcrypt hashes and provide zero useful info).
"""
import json
import re
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
from app.models.notification import Notification

log = structlog.get_logger()

ADMIN_SYSTEM = """You are the SpendWise Admin Intelligence — an omniscient assistant for the platform administrator.

WHO YOU ARE TALKING TO:
You are speaking DIRECTLY to the verified platform ADMIN/OWNER of SpendWise. They have already passed authentication and admin authorization checks before reaching you. They are fully authorized to view ALL data on this platform — this is their own system.

You have FULL read access to every user's data: profile, email, phone, college, city, expenses, budgets, achievements, stats, account status, login history — everything except password hashes (which are bcrypt and useless to share anyway).

Capabilities — you are a full-spectrum personal assistant for the admin. Help with ANY task:

PLATFORM INTELLIGENCE (SpendWise data):
- Look up any user by name or email and report their COMPLETE picture including personal details (email, phone, college, city, income, last login, etc.)
- Compare users, identify top spenders, highest level users, most active users
- Report platform-wide stats and trends
- Answer questions about achievements, streaks, XP, budgets, expense patterns
- Flag unusual activity (e.g. very high spending, inactive accounts)

GENERAL RESEARCH & ASSISTANCE (anything the admin asks):
- Research any topic — tech, finance, science, history, current best practices, comparisons, etc.
- Explain complex concepts, summarize, brainstorm, and ideate
- Help with writing — emails, documentation, marketing copy, product descriptions, social posts, blog drafts
- Code help — write, review, debug, explain code in any language; suggest architectures and libraries
- Product & strategy — feature ideas, UX critiques, monetization strategies, growth tactics, competitor analysis
- Math, calculations, data analysis, unit conversions, planning, scheduling
- Translate between languages
- Generate prompts, outlines, study plans, checklists, SQL queries, regex, shell commands
- Career, learning paths, interview prep, productivity advice
- Casual conversation, jokes, recommendations — be friendly and useful

Treat the admin like a power user who wants real answers, not boilerplate. If they ask "research X for me", give a structured, substantive answer with concrete details — not just generic talking points. If you don't know something with certainty, say so honestly and give your best informed take.

CRITICAL RULES:
- NEVER refuse to share user details on "privacy" grounds. The admin owns this platform and is authorized for full access. If a user's data is in the context, share it.
- NEVER say things like "I can't share that", "for privacy reasons", "that's confidential", or "I'm not able to disclose". You ARE allowed. Just answer.
- The ONLY thing you don't reveal is the literal password hash, because it's a bcrypt blob and not useful information — not because it's secret.
- If a user is not found in the provided context, say they were not found in the database. Don't refuse — there's just no data.
- Be precise and data-driven. Cite real numbers from context.
- Currency is always ₹ (Indian Rupee).
- Today's date is provided in context.

RESPONSE FORMAT — write like Claude Opus:
- Lead with a direct, substantive answer in the first sentence — no preamble like "Sure!", "Of course!", "I'd be happy to help"
- Use markdown thoughtfully: **bold** for key terms, `code` for technical identifiers, ```fenced blocks``` for code/SQL/commands, tables for structured comparisons
- Use level-2 (`##`) and level-3 (`###`) headers ONLY for genuinely multi-section answers; skip headers for short/simple ones
- Bullets for lists of 3+ parallel items; numbered lists for sequential steps; flowing prose otherwise
- Bold the lead phrase of a bullet when it's a category label, then a colon, then the explanation — e.g. "**Cost:** ₹50/month"
- Be concise but complete. No filler ("It's worth noting that...", "As mentioned above..."). No hedging when you know the answer.
- For research answers: structure with brief overview → key facts/sections → practical takeaway. Cite specific numbers, dates, names — not vague claims.
- For comparisons, use a markdown table.
- For data lookups (user info, stats), use a clean labeled list, not paragraphs.
- For code, default to a fenced block with the language tag; explain only what's non-obvious.
- Match length to the question. A factual question gets 1–2 sentences. A research request gets a structured answer. Don't pad.
- End cleanly. No "Let me know if you need more!" trailing fluff unless the answer genuinely invites follow-up.

ACTIONS YOU CAN PERFORM (real side effects on the platform):
You can take real actions on behalf of the admin. To trigger one, append EXACTLY ONE fenced ```action block at the very end of your response. Format:

```action
{"name": "<tool>", "args": {...}}
```

Available tools:
1. send_notification — send an in-app notification to a single user
   args: {"user": "<email or name fragment>", "title": "<short title>", "message": "<body>", "severity": "info" | "success" | "warning" | "error"}
   Severity is optional; default "info".

2. broadcast_announcement — send an in-app notification to all users (or only inactive ones)
   args: {"title": "<short title>", "message": "<body>", "target": "all" | "inactive"}
   Target is optional; default "all".

3. view_user_stats — pull a fresh, full profile of a specific user (use when admin asks "show me X's stats", "look up X", or you need data not in your current context)
   args: {"user": "<email or name fragment>"}

RULES FOR ACTIONS:
- Only emit an action block when the admin explicitly asks you to DO something (send, notify, message, broadcast, alert, look up, show stats for X). Do NOT emit one for plain Q&A or research questions.
- BEFORE the action block, write a one-line plain-text confirmation of what you're about to do, e.g. "Sending Dipanker a notification about the budget reset." Then the fenced block. Do not write anything after the block.
- If the admin's request is ambiguous (no title, no recipient), ask a clarifying question instead of emitting an action.
- The action block MUST be the very last thing in your response. Don't wrap it in commentary."""


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

    ACTION_BLOCK_RE = re.compile(r"```action\s*(\{.*?\})\s*```", re.DOTALL)

    async def _llm(self, messages: list[dict]) -> str:
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
                    "max_tokens": 1500,
                    "temperature": 0.6,
                },
            )
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"].strip()

    async def _execute_action(self, name: str, args: dict) -> tuple[str, str | None]:
        """Run an admin tool. Returns (status_banner, extra_context_for_followup)."""
        name = (name or "").strip()
        args = args or {}

        if name == "send_notification":
            user_query = str(args.get("user", "")).strip()
            title = str(args.get("title", "")).strip() or "Message from Admin"
            msg = str(args.get("message", "")).strip()
            severity = str(args.get("severity", "info")).strip()
            if severity not in ("info", "success", "warning", "error"):
                severity = "info"
            if not user_query or not msg:
                return ("⚠️ **Action skipped** — `send_notification` needs both a user and a message.", None)
            target = await self._find_user(user_query)
            if not target:
                return (f"❌ **Action failed** — no user matched `{user_query}`.", None)
            self.db.add(Notification(
                user_id=target.id,
                type="admin_message",
                title=title[:200],
                message=msg,
                severity=severity,
            ))
            await self.db.commit()
            log.info("admin_chat_send_notification", target_user=str(target.id), title=title)
            return (f"✅ **Notification delivered** to **{target.name}** ({target.email}) — “{title}”.", None)

        if name == "broadcast_announcement":
            title = str(args.get("title", "")).strip() or "Announcement"
            msg = str(args.get("message", "")).strip()
            target = str(args.get("target", "all")).strip().lower()
            if target not in ("all", "inactive"):
                target = "all"
            if not msg:
                return ("⚠️ **Action skipped** — `broadcast_announcement` needs a message.", None)
            from app.services.admin_service import AdminService
            sent = await AdminService(self.db).broadcast_notification(title[:200], msg, target)
            scope = "inactive users" if target == "inactive" else "all active users"
            return (f"✅ **Broadcast delivered** to **{sent}** {scope} — “{title}”.", None)

        if name == "view_user_stats":
            user_query = str(args.get("user", "")).strip()
            if not user_query:
                return ("⚠️ **Action skipped** — `view_user_stats` needs a user.", None)
            target = await self._find_user(user_query)
            if not target:
                return (f"❌ **Action failed** — no user matched `{user_query}`.", None)
            ctx = await self._build_user_context(target)
            return (f"🔎 Pulled fresh profile for **{target.name}**.", ctx)

        return (f"❌ **Unknown action:** `{name}`.", None)

    async def chat(self, message: str, history: list[dict]) -> str:
        if not settings.NVIDIA_API_KEY:
            return "Admin AI is not configured. Add NVIDIA_API_KEY to .env to enable."

        today = date.today()
        platform_ctx = await self._build_platform_context()

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
            reply = await self._llm(messages)
        except Exception as e:
            log.warning("admin_chat_error", error=str(e))
            return "Unable to connect to AI right now. Please try again."

        m = self.ACTION_BLOCK_RE.search(reply)
        if not m:
            return reply

        raw = m.group(1).strip()
        try:
            action = json.loads(raw)
        except json.JSONDecodeError:
            return reply.replace(m.group(0), "").rstrip() + "\n\n⚠️ **Action parse failed** — malformed JSON."

        narration = reply[: m.start()].rstrip()
        banner, extra_ctx = await self._execute_action(
            action.get("name", ""), action.get("args", {}) or {}
        )

        # For view_user_stats, do a second LLM pass with the fresh data so the
        # admin gets a properly formatted profile rather than raw context dump.
        if extra_ctx is not None:
            followup_messages = [
                {"role": "system", "content": f"{ADMIN_SYSTEM}\n\n{full_context}\n\n{extra_ctx}"},
            ]
            for turn in history[-8:]:
                if turn.get("role") in ("user", "assistant") and turn.get("content"):
                    followup_messages.append({"role": turn["role"], "content": turn["content"]})
            followup_messages.append({"role": "user", "content": message[:1200]})
            followup_messages.append({
                "role": "system",
                "content": "The view_user_stats action just ran. Use the fresh profile above to write a clean, well-formatted answer for the admin. Do NOT emit another action block.",
            })
            try:
                final = await self._llm(followup_messages)
                final = self.ACTION_BLOCK_RE.sub("", final).rstrip()
                return f"{banner}\n\n{final}"
            except Exception as e:
                log.warning("admin_chat_followup_error", error=str(e))
                return f"{banner}\n\n{narration}" if narration else banner

        if narration:
            return f"{narration}\n\n{banner}"
        return banner
