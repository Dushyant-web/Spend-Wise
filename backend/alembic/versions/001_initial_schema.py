"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-04-23

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── users ──────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=True),
        sa.Column("avatar_url", sa.String(500), nullable=True),
        sa.Column("phone", sa.String(15), nullable=True),
        sa.Column("college", sa.String(200), nullable=True),
        sa.Column("city", sa.String(100), nullable=True),
        sa.Column("monthly_income", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("auth_provider", sa.String(20), nullable=False, server_default="email"),
        sa.Column("google_id", sa.String(100), nullable=True),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("is_admin", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("onboarding_done", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("refresh_token", sa.Text(), nullable=True),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("google_id"),
    )
    op.create_index("idx_users_email", "users", ["email"])
    op.create_index("idx_users_google_id", "users", ["google_id"])

    # ── user_stats ─────────────────────────────────────────────────────────
    op.create_table(
        "user_stats",
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("total_xp", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("current_level", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("current_streak", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("longest_streak", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_active_date", sa.Date(), nullable=True),
        sa.Column("total_saved", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("monthly_challenges_completed", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("smart_spender_rank", sa.String(20), nullable=False, server_default="bronze"),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id"),
    )

    # ── expenses ───────────────────────────────────────────────────────────
    op.create_table(
        "expenses",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("subcategory", sa.String(100), nullable=True),
        sa.Column("merchant", sa.String(200), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("payment_mode", sa.String(30), nullable=False, server_default="upi"),
        sa.Column("source", sa.String(20), nullable=False, server_default="manual"),
        sa.Column("tags", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("is_recurring", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("recurring_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("split_with", postgresql.JSONB(), nullable=True),
        sa.Column("receipt_url", sa.String(500), nullable=True),
        sa.Column("expense_date", sa.Date(), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_expenses_user_id", "expenses", ["user_id"])
    op.create_index("idx_expenses_date", "expenses", ["expense_date"])
    op.create_index("idx_expenses_category", "expenses", ["category"])
    op.create_index("idx_expenses_user_date", "expenses", ["user_id", "expense_date"])

    # ── recurring_expenses ─────────────────────────────────────────────────
    op.create_table(
        "recurring_expenses",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("merchant", sa.String(200), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("frequency", sa.String(20), nullable=False),
        sa.Column("next_due_date", sa.Date(), nullable=False),
        sa.Column("last_triggered", sa.Date(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_recurring_user_id", "recurring_expenses", ["user_id"])

    # ── budgets ────────────────────────────────────────────────────────────
    op.create_table(
        "budgets",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("month", sa.Integer(), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("monthly_limit", sa.Numeric(12, 2), nullable=False),
        sa.Column("category_limits", postgresql.JSONB(), nullable=False, server_default="{}"),
        sa.Column("rollover_enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("savings_goal", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "month", "year", name="uq_budget_user_month_year"),
    )
    op.create_index("idx_budgets_user_month", "budgets", ["user_id", "year", "month"])

    # ── predictions ────────────────────────────────────────────────────────
    op.create_table(
        "predictions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("month", sa.Integer(), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("predicted_total", sa.Numeric(12, 2), nullable=False),
        sa.Column("predicted_by_category", postgresql.JSONB(), nullable=False, server_default="{}"),
        sa.Column("confidence_score", sa.Numeric(5, 4), nullable=True),
        sa.Column("model_used", sa.String(50), nullable=True),
        sa.Column("actual_total", sa.Numeric(12, 2), nullable=True),
        sa.Column("generated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_predictions_user_id", "predictions", ["user_id"])

    # ── notifications ──────────────────────────────────────────────────────
    op.create_table(
        "notifications",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("data", postgresql.JSONB(), nullable=False, server_default="{}"),
        sa.Column("severity", sa.String(20), nullable=False, server_default="info"),
        sa.Column("is_seen", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("is_pushed", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_notifications_user", "notifications", ["user_id", "is_seen", "created_at"])

    # ── achievements ───────────────────────────────────────────────────────
    op.create_table(
        "achievements",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("badge_id", sa.String(50), nullable=False),
        sa.Column("badge_name", sa.String(100), nullable=False),
        sa.Column("xp_awarded", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("earned_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "badge_id", name="uq_achievement_user_badge"),
    )
    op.create_index("idx_achievements_user_id", "achievements", ["user_id"])


def downgrade() -> None:
    op.drop_table("achievements")
    op.drop_table("notifications")
    op.drop_table("predictions")
    op.drop_table("budgets")
    op.drop_table("recurring_expenses")
    op.drop_table("expenses")
    op.drop_table("user_stats")
    op.drop_table("users")
