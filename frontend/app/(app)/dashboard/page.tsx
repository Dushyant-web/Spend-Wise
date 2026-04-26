"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Receipt, PiggyBank, ArrowRight, Plus,
  TrendingUp, TrendingDown, Zap, Sparkles, ChevronRight,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useCurrentBudget } from "@/hooks/useBudget";
import { useExpenses } from "@/hooks/useExpenses";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuthStore } from "@/stores/authStore";
import { CATEGORY_MAP, MONTHS } from "@/lib/constants";
import { formatINR, formatINRCompact, getLevelName } from "@/lib/utils";
import AddExpenseModal from "@/components/expenses/AddExpenseModal";
import EditExpenseModal from "@/components/expenses/EditExpenseModal";
import DailySpending from "@/components/charts/DailySpending";
import CategoryDonut from "@/components/charts/CategoryDonut";
import InsightCards from "@/components/insights/InsightCards";
import ExpenseDetailModal from "@/components/modals/ExpenseDetailModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import type { Expense } from "@/types/expense";
import api from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const SpendingOrb = dynamic(() => import("@/components/three/SpendingOrb"), { ssr: false });

/* ── Count-up hook ── */
function useCountUp(target: number, duration = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const raf = () => {
      start = Math.min(start + step, target);
      setVal(Math.round(start));
      if (start < target) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

/* ── Skeleton ── */
function Skeleton({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skeleton rounded-lg ${className}`} style={style} />;
}

/* ── KPI Card ── */
function KPICard({
  label, rawValue, formattedValue, sub, accent, loading, onClick,
}: {
  label: string; rawValue: number; formattedValue: string; sub?: string;
  accent: string; loading: boolean; onClick?: () => void;
}) {
  const counted = useCountUp(loading ? 0 : rawValue);

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 22 } } }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={onClick ? "cursor-pointer" : ""}
      style={{
        background: "var(--bg-base)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 12,
        padding: "16px 18px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute", inset: 0, opacity: 0.06,
          background: `radial-gradient(ellipse at top left, ${accent}, transparent 70%)`,
        }}
      />
      <p style={{ color: "var(--text-tertiary)", fontSize: "0.70rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em" }}>
        {label}
      </p>
      {loading ? (
        <Skeleton className="mt-2 h-7 w-3/4" />
      ) : (
        <p className="font-display font-bold tabular-nums mt-1" style={{ color: "var(--text-primary)", fontSize: "1.4rem" }}>
          {formattedValue.replace(/[\d,]+/, () => {
            const num = counted;
            return num >= 1e5 ? `${(num / 1e5).toFixed(1)}L` : num >= 1e3 ? `${(num / 1e3).toFixed(1)}K` : String(num);
          })}
        </p>
      )}
      {sub && !loading && (
        <p style={{ color: "var(--text-tertiary)", fontSize: "0.70rem", marginTop: 4 }}>{sub}</p>
      )}
      {sub && loading && <Skeleton className="mt-1.5 h-3.5 w-1/2" />}
    </motion.div>
  );
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const today = new Date();
  const { data: budget, isLoading: budgetLoading } = useCurrentBudget();
  const { data: expenses, isLoading: expLoading } = useExpenses({
    month: today.getMonth() + 1,
    year: today.getFullYear(),
    per_page: 5,
    page: 1,
  });
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();

  const [addOpen, setAddOpen] = useState(false);
  const [detailExpense, setDetailExpense] = useState<Expense | null>(null);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null);

  const xp = (user as any)?.stats?.total_xp ?? 0;
  const level = (user as any)?.stats?.current_level ?? 1;
  const streak = (user as any)?.stats?.current_streak ?? 0;
  const monthName = MONTHS[today.getMonth()];
  const xpInLevel = xp % 100;
  const firstName = user?.name?.split(" ")[0] ?? "there";

  const handleDeleteExpense = async () => {
    if (!deleteExpense) return;
    await api.delete(`/expenses/${deleteExpense.id}`);
    await qc.invalidateQueries({ queryKey: ["expenses"] });
    await qc.invalidateQueries({ queryKey: ["analytics"] });
    toast.success("Expense deleted");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 pb-24 lg:pb-8 space-y-5">

      {/* Hero row: greeting + 3D orb */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl overflow-hidden flex items-center justify-between"
        style={{
          background: "var(--bg-base)",
          border: "1px solid var(--border-subtle)",
          minHeight: 120,
          padding: "20px 24px",
        }}
      >
        {/* Gradient glow */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.08,
          background: "radial-gradient(ellipse at 80% 50%, var(--accent), transparent 65%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.813rem" }}>
            {monthName} {today.getFullYear()} · Day {today.getDate()}
          </p>
          <h2
            className="font-display font-bold mt-0.5"
            style={{ color: "var(--text-primary)", fontSize: "1.5rem", letterSpacing: "-0.02em" }}
          >
            Hey, {firstName}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.813rem", marginTop: 6 }}>
            Press <kbd style={{
              background: "var(--bg-overlay)", border: "1px solid var(--border-default)",
              borderRadius: 4, padding: "1px 6px", fontSize: "0.70rem", color: "var(--text-secondary)",
            }}>⌘K</kbd> to quick-add an expense
          </p>
        </div>

        {/* 3D Scene */}
        <div
          style={{ width: 120, height: 120, position: "relative", zIndex: 1, pointerEvents: "none" }}
          className="hidden sm:block"
        >
          <SpendingOrb />
        </div>

        <div
          style={{
            position: "absolute",
            right: 20,
            bottom: 18,
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            alignItems: "stretch",
          }}
        >
          <Link href="/ai-coach" aria-label="Open AI Coach" style={{ textDecoration: "none" }}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              style={{
                background: "linear-gradient(135deg, rgba(167,139,250,0.16), rgba(108,99,255,0.10))",
                border: "1px solid var(--border-default)",
                color: "var(--accent)",
                padding: "0 14px",
                height: 40,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                borderRadius: 12,
                fontSize: "0.813rem",
                fontWeight: 600,
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <Sparkles style={{ width: 15, height: 15 }} />
              AI Coach
            </motion.div>
          </Link>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setAddOpen(true)}
            className="btn btn-primary"
            style={{ height: 44 }}
          >
            <Plus style={{ width: 15, height: 15 }} />
            Add Expense
          </motion.button>
        </div>
      </motion.div>

      {/* KPI row */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <KPICard
          label="Total Spent"
          rawValue={analytics ? analytics.overview.total_spent : 0}
          formattedValue={analytics ? formatINRCompact(analytics.overview.total_spent) : "—"}
          sub={analytics ? `${analytics.overview.transaction_count} transactions` : ""}
          accent="var(--accent)"
          loading={analyticsLoading}
        />
        <KPICard
          label="Remaining"
          rawValue={budget ? Math.max(0, Number(budget.remaining_budget)) : 0}
          formattedValue={budget ? formatINRCompact(Math.max(0, Number(budget.remaining_budget))) : "—"}
          sub={budget ? `${budget.percentage_used}% used` : "No budget set"}
          accent="var(--success)"
          loading={budgetLoading}
        />
        <KPICard
          label="Daily Avg"
          rawValue={analytics ? analytics.overview.avg_per_day : 0}
          formattedValue={analytics ? formatINRCompact(analytics.overview.avg_per_day) : "—"}
          sub="per day"
          accent="var(--warning)"
          loading={analyticsLoading}
        />
        <KPICard
          label="Level & Streak"
          rawValue={level}
          formattedValue={`Lv.${level}`}
          sub={`🔥 ${streak}d · ${xpInLevel}/100 XP`}
          accent="#F59E0B"
          loading={false}
        />
      </motion.div>

      {/* Budget bar */}
      <AnimatePresence>
        {!budgetLoading && budget && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: "var(--bg-base)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 16,
              padding: "20px 24px",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <PiggyBank style={{ width: 15, height: 15, color: "var(--accent)" }} />
                <span style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 600 }}>
                  {monthName} Budget
                </span>
                {analytics?.overview.compared_to_last_month !== undefined && (
                  <span
                    className="flex items-center gap-0.5"
                    style={{
                      fontSize: "0.70rem", fontWeight: 500, padding: "2px 8px", borderRadius: 99,
                      background: analytics.overview.compared_to_last_month > 5
                        ? "rgba(240,86,114,0.1)" : "rgba(16,201,143,0.1)",
                      color: analytics.overview.compared_to_last_month > 5
                        ? "var(--danger)" : "var(--success)",
                    }}
                  >
                    {analytics.overview.compared_to_last_month > 0
                      ? <TrendingUp style={{ width: 10, height: 10 }} />
                      : <TrendingDown style={{ width: 10, height: 10 }} />}
                    {Math.abs(analytics.overview.compared_to_last_month).toFixed(0)}% vs last month
                  </span>
                )}
              </div>
              <Link
                href="/budget"
                className="flex items-center gap-1"
                style={{ color: "var(--text-tertiary)", fontSize: "0.75rem" }}
              >
                Details <ChevronRight style={{ width: 12, height: 12 }} />
              </Link>
            </div>

            <div
              style={{ height: 6, borderRadius: 99, overflow: "hidden", background: "var(--bg-overlay)" }}
            >
              <motion.div
                style={{
                  height: "100%", borderRadius: 99,
                  background: budget.percentage_used >= 90
                    ? "linear-gradient(90deg, var(--danger), #F87171)"
                    : budget.percentage_used >= 70
                    ? "linear-gradient(90deg, var(--warning), #FCD34D)"
                    : "linear-gradient(90deg, var(--accent), #7DDEFF)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(budget.percentage_used, 100)}%` }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>

            <div className="flex justify-between mt-2" style={{ color: "var(--text-tertiary)", fontSize: "0.70rem" }}>
              <span>Spent {formatINR(budget.spending_so_far)}</span>
              <span>Limit {formatINR(budget.monthly_limit)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!budgetLoading && !budget && (
        <Link href="/budget">
          <motion.div
            whileHover={{ scale: 1.01 }}
            style={{
              background: "var(--bg-base)",
              border: "1px dashed color-mix(in srgb, var(--accent) 40%, transparent)",
              borderRadius: 16, padding: "20px 24px",
              textAlign: "center", cursor: "pointer",
            }}
          >
            <PiggyBank style={{ width: 32, height: 32, color: "var(--accent)", margin: "0 auto 8px" }} />
            <p style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 500 }}>
              Set your {monthName} budget
            </p>
            <p style={{ color: "var(--text-tertiary)", fontSize: "0.75rem", marginTop: 4 }}>
              Track spending against a monthly limit
            </p>
          </motion.div>
        </Link>
      )}

      {/* Charts row */}
      {analyticsLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton style={{ height: 280, borderRadius: 16 }} />
          <Skeleton style={{ height: 280, borderRadius: 16 }} />
        </div>
      ) : analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: "var(--bg-base)", border: "1px solid var(--border-subtle)",
              borderRadius: 16, padding: "20px 24px",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 600 }}>
                Spending by Category
              </h3>
              <Link href="/reports" className="flex items-center gap-1" style={{ color: "var(--text-tertiary)", fontSize: "0.75rem" }}>
                Full report <ArrowRight style={{ width: 12, height: 12 }} />
              </Link>
            </div>
            <CategoryDonut data={analytics.category_breakdown.slice(0, 5)} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            style={{
              background: "var(--bg-base)", border: "1px solid var(--border-subtle)",
              borderRadius: 16, padding: "20px 24px",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 600 }}>
                Daily Spending
              </h3>
              <span style={{ color: "var(--text-tertiary)", fontSize: "0.75rem" }}>Cumulative</span>
            </div>
            <DailySpending data={analytics.daily_spending} showCumulative />
          </motion.div>
        </div>
      )}

      {/* Smart insights */}
      <InsightCards limit={3} />

      {/* XP progress */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          background: "var(--bg-base)", border: "1px solid var(--border-subtle)",
          borderRadius: 16, padding: "20px 24px",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Zap style={{ width: 15, height: 15, color: "#F59E0B" }} />
          <span style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 600 }}>
            {getLevelName(level)} · Level {level}
          </span>
          <span style={{ color: "var(--text-tertiary)", fontSize: "0.70rem", marginLeft: "auto" }}>
            {xp} total XP
          </span>
          <Link href="/achievements" className="flex items-center gap-0.5" style={{ color: "var(--accent)", fontSize: "0.75rem" }}>
            Badges <Sparkles style={{ width: 11, height: 11 }} />
          </Link>
        </div>
        <div style={{ height: 6, background: "var(--bg-overlay)", borderRadius: 99, overflow: "hidden" }}>
          <motion.div
            style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #F59E0B, #FCD34D)" }}
            initial={{ width: 0 }}
            animate={{ width: `${xpInLevel}%` }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <p style={{ color: "var(--text-tertiary)", fontSize: "0.70rem", marginTop: 8 }}>
          {100 - xpInLevel} XP to Level {level + 1} · {streak}🔥 day streak
        </p>
      </motion.div>

      {/* Recent expenses */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        style={{
          background: "var(--bg-base)", border: "1px solid var(--border-subtle)",
          borderRadius: 16, padding: "20px 24px",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Receipt style={{ width: 15, height: 15, color: "var(--success)" }} />
            <span style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 600 }}>
              Recent Expenses
            </span>
          </div>
          <Link href="/expenses" className="flex items-center gap-1" style={{ color: "var(--text-tertiary)", fontSize: "0.75rem" }}>
            See all <ChevronRight style={{ width: 12, height: 12 }} />
          </Link>
        </div>

        {expLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }} />
                <div className="flex-1 space-y-1.5">
                  <Skeleton style={{ height: 13, width: "60%" }} />
                  <Skeleton style={{ height: 11, width: "35%" }} />
                </div>
                <Skeleton style={{ height: 14, width: 56 }} />
              </div>
            ))}
          </div>
        ) : !expenses?.items.length ? (
          <div className="text-center py-8">
            <p style={{ color: "var(--text-tertiary)", fontSize: "0.875rem" }}>No expenses this month yet.</p>
            <button
              onClick={() => setAddOpen(true)}
              className="mt-3 flex items-center gap-1.5 mx-auto"
              style={{ color: "var(--accent)", fontSize: "0.875rem" }}
            >
              <Plus style={{ width: 14, height: 14 }} /> Add your first expense
            </button>
          </div>
        ) : (
          <div>
            {expenses.items.map((exp, i) => {
              const cat = CATEGORY_MAP[exp.category];
              return (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ x: 2 }}
                  onClick={() => setDetailExpense(exp)}
                  className="flex items-center gap-3 py-2.5 cursor-pointer rounded-lg px-1.5 -mx-1.5 transition-colors"
                  style={{ borderBottom: i < expenses.items.length - 1 ? "1px solid var(--border-subtle)" : "none" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-overlay)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: cat?.color ? `${cat.color}20` : "var(--bg-overlay)" }}
                  >
                    {cat?.emoji ?? "💰"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate" style={{ color: "var(--text-primary)", fontSize: "0.813rem" }}>
                      {exp.merchant || cat?.label || exp.category}
                    </p>
                    <p style={{ color: "var(--text-tertiary)", fontSize: "0.70rem" }}>
                      {new Date(exp.expense_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      {" · "}
                      <span className="capitalize">{exp.payment_mode}</span>
                    </p>
                  </div>
                  <span className="tabular-nums" style={{ color: "var(--text-primary)", fontSize: "0.813rem", fontWeight: 600 }}>
                    {formatINR(exp.amount)}
                  </span>
                  <ChevronRight style={{ width: 13, height: 13, color: "var(--text-tertiary)", flexShrink: 0 }} />
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      <AddExpenseModal open={addOpen} onClose={() => setAddOpen(false)} />

      <ExpenseDetailModal
        open={!!detailExpense}
        onClose={() => setDetailExpense(null)}
        expense={detailExpense}
        onEdit={(exp) => setEditExpense(exp)}
        onDelete={(exp) => setDeleteExpense(exp)}
      />

      {editExpense && (
        <EditExpenseModal
          expense={editExpense}
          open={!!editExpense}
          onClose={() => setEditExpense(null)}
        />
      )}

      <DeleteConfirmModal
        open={!!deleteExpense}
        onClose={() => setDeleteExpense(null)}
        title="Delete Expense"
        description={
          deleteExpense
            ? `Delete ${formatINR(deleteExpense.amount)} from ${deleteExpense.merchant || deleteExpense.category}?`
            : ""
        }
        onConfirm={handleDeleteExpense}
      />
    </div>
  );
}
