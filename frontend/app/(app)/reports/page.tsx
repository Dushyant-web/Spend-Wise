"use client";

import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Minus,
  ShoppingBag, BarChart3,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useAnalytics } from "@/hooks/useAnalytics";
import CategoryDonut from "@/components/charts/CategoryDonut";
import MonthlyTrend from "@/components/charts/MonthlyTrend";
import DailySpending from "@/components/charts/DailySpending";
import TopMerchants from "@/components/charts/TopMerchants";
import PaymentModeChart from "@/components/charts/PaymentModeChart";
import InsightCards from "@/components/insights/InsightCards";
import { MONTHS } from "@/lib/constants";
import { formatINR, formatINRCompact } from "@/lib/utils";

const DataCrystal = dynamic(() => import("@/components/three/DataCrystal"), { ssr: false });

function Skeleton({ style = {} }: { style?: React.CSSProperties }) {
  return <div className="skeleton rounded-lg" style={style} />;
}

function StatCard({
  label, value, sub, icon, trend, accent,
}: {
  label: string; value: string; sub?: string;
  icon: React.ReactNode; trend?: number; accent?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "var(--bg-base)", border: "1px solid var(--border-subtle)",
        borderRadius: 12, padding: "16px 18px", position: "relative", overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute", inset: 0, opacity: 0.06,
          background: `radial-gradient(ellipse at top left, ${accent ?? "var(--accent)"}, transparent 70%)`,
        }}
      />
      <div className="flex items-start justify-between mb-2" style={{ position: "relative" }}>
        <div
          style={{
            padding: 7, borderRadius: 8,
            background: "var(--accent-subtle)", color: "var(--accent)",
          }}
        >
          {icon}
        </div>
        {trend !== undefined && (
          <span
            className="flex items-center gap-0.5"
            style={{
              fontSize: "0.75rem", fontWeight: 500,
              color: trend > 0 ? "var(--danger)" : trend < 0 ? "var(--success)" : "var(--text-tertiary)",
            }}
          >
            {trend > 0 ? <ArrowUpRight style={{ width: 12, height: 12 }} />
              : trend < 0 ? <ArrowDownRight style={{ width: 12, height: 12 }} />
              : <Minus style={{ width: 12, height: 12 }} />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <p
        className="font-display font-bold tabular-nums"
        style={{ color: "var(--text-primary)", fontSize: "1.25rem", position: "relative", marginTop: 4 }}
      >
        {value}
      </p>
      <p style={{ color: "var(--text-tertiary)", fontSize: "0.70rem", marginTop: 4, position: "relative" }}>
        {label}
      </p>
      {sub && (
        <p style={{ color: "var(--text-tertiary)", fontSize: "0.70rem", position: "relative" }}>{sub}</p>
      )}
    </motion.div>
  );
}

const cardStyle = {
  background: "var(--bg-base)", border: "1px solid var(--border-subtle)",
  borderRadius: 16, padding: "20px 24px",
};

export default function ReportsPage() {
  const { data, isLoading, isError } = useAnalytics();
  const today = new Date();
  const monthName = MONTHS[today.getMonth()];

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 lg:px-8 pb-24 lg:pb-8 space-y-5">
        {/* Hero skeleton */}
        <Skeleton style={{ height: 140, borderRadius: 16 }} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <Skeleton key={i} style={{ height: 110, borderRadius: 12 }} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton style={{ height: 280, borderRadius: 16 }} />
          <Skeleton style={{ height: 280, borderRadius: 16 }} />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh]"
        style={{ color: "var(--text-tertiary)" }}
      >
        <BarChart3 style={{ width: 40, height: 40, opacity: 0.4, marginBottom: 12 }} />
        <p>No analytics data yet. Add some expenses first.</p>
      </div>
    );
  }

  const { overview, category_breakdown, monthly_trend, daily_spending, top_merchants, payment_modes } = data;

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 pb-24 lg:pb-8 space-y-5">

      {/* Hero with 3D DataCrystal */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden flex items-center justify-between"
        style={{ ...cardStyle, minHeight: 120, padding: "20px 24px" }}
      >
        <div style={{
          position: "absolute", inset: 0, opacity: 0.07,
          background: "radial-gradient(ellipse at 80% 50%, var(--success), transparent 65%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.813rem" }}>
            Day {overview.days_elapsed} of {overview.days_in_month}
          </p>
          <h2
            className="font-display font-bold mt-0.5"
            style={{ color: "var(--text-primary)", fontSize: "1.4rem", letterSpacing: "-0.02em" }}
          >
            {monthName} {today.getFullYear()} Report
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.813rem", marginTop: 4 }}>
            {overview.transaction_count} transactions recorded
          </p>
        </div>

        <div
          style={{ width: 120, height: 120, pointerEvents: "none", position: "relative", zIndex: 1 }}
          className="hidden sm:block"
        >
          <DataCrystal />
        </div>
      </motion.div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Spent"
          value={formatINR(overview.total_spent)}
          sub={`${overview.transaction_count} transactions`}
          icon={<TrendingUp style={{ width: 14, height: 14 }} />}
          trend={overview.compared_to_last_month}
          accent="var(--accent)"
        />
        <StatCard
          label="Daily Average"
          value={formatINR(overview.avg_per_day)}
          sub="per day this month"
          icon={<BarChart3 style={{ width: 14, height: 14 }} />}
          accent="var(--warning)"
        />
        <StatCard
          label="Avg per Transaction"
          value={formatINR(overview.avg_per_transaction)}
          icon={<ShoppingBag style={{ width: 14, height: 14 }} />}
          accent="var(--success)"
        />
        <StatCard
          label="Projected Month"
          value={formatINRCompact(overview.projected_monthly)}
          sub="at current rate"
          icon={<TrendingUp style={{ width: 14, height: 14 }} />}
          accent="#F59E0B"
        />
      </div>

      {/* Smart insights */}
      <InsightCards limit={4} />

      {/* Month comparison banner */}
      {overview.compared_to_last_month !== 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2"
          style={{
            borderRadius: 10, padding: "12px 16px", fontSize: "0.875rem",
            background: overview.compared_to_last_month > 0
              ? "rgba(240,86,114,0.08)" : "rgba(16,201,143,0.08)",
            border: `1px solid ${overview.compared_to_last_month > 0 ? "rgba(240,86,114,0.2)" : "rgba(16,201,143,0.2)"}`,
            color: overview.compared_to_last_month > 0 ? "var(--danger)" : "var(--success)",
          }}
        >
          {overview.compared_to_last_month > 0
            ? <><ArrowUpRight style={{ width: 15, height: 15, flexShrink: 0 }} /> You're spending <strong style={{ margin: "0 4px" }}>{Math.abs(overview.compared_to_last_month).toFixed(1)}% more</strong> than last month.</>
            : <><ArrowDownRight style={{ width: 15, height: 15, flexShrink: 0 }} /> You're spending <strong style={{ margin: "0 4px" }}>{Math.abs(overview.compared_to_last_month).toFixed(1)}% less</strong> than last month. Great job!</>
          }
        </motion.div>
      )}

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div style={cardStyle}>
          <h3 style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 600, marginBottom: 16 }}>
            Spending by Category
          </h3>
          <CategoryDonut data={category_breakdown} />
        </div>
        <div style={cardStyle}>
          <h3 style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 600, marginBottom: 4 }}>
            6-Month Trend
          </h3>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.75rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 12, borderTop: "2px dashed var(--success)", display: "inline-block" }} /> Budget limit
          </p>
          <MonthlyTrend data={monthly_trend} />
        </div>
      </div>

      {/* Daily spending */}
      <div style={cardStyle}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 600 }}>
            Daily Spending ({monthName})
          </h3>
          <span style={{ color: "var(--text-tertiary)", fontSize: "0.75rem" }}>Cumulative total</span>
        </div>
        <DailySpending data={daily_spending} showCumulative />
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div style={cardStyle}>
          <h3 style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 600, marginBottom: 16 }}>
            Top Merchants
          </h3>
          <TopMerchants data={top_merchants} />
        </div>
        <div style={cardStyle}>
          <h3 style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 600, marginBottom: 16 }}>
            Payment Methods
          </h3>
          <PaymentModeChart data={payment_modes} />
        </div>
      </div>

      {/* Monthly breakdown table */}
      <div style={cardStyle}>
        <h3 style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 600, marginBottom: 16 }}>
          Monthly Summary
        </h3>
        <div>
          {monthly_trend.slice().reverse().map((item, i) => {
            const overBudget = item.budget && item.total > item.budget;
            return (
              <div
                key={`${item.year}-${item.month}`}
                className="flex items-center justify-between py-3"
                style={{ borderBottom: i < monthly_trend.length - 1 ? "1px solid var(--border-subtle)" : "none" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: i === 0 ? "var(--accent)" : "var(--bg-overlay)",
                    }}
                  />
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{item.label}</span>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 500 }}>
                      {formatINR(item.total)}
                    </p>
                    <p style={{ color: "var(--text-tertiary)", fontSize: "0.70rem" }}>{item.count} txns</p>
                  </div>
                  {item.budget && (
                    <div>
                      <p style={{ color: "var(--text-tertiary)", fontSize: "0.70rem" }}>Budget</p>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                        {formatINR(item.budget)}
                      </p>
                    </div>
                  )}
                  {item.budget && (
                    <span
                      style={{
                        fontSize: "0.70rem", fontWeight: 500, padding: "2px 8px", borderRadius: 99,
                        background: overBudget ? "rgba(240,86,114,0.1)" : "rgba(16,201,143,0.1)",
                        color: overBudget ? "var(--danger)" : "var(--success)",
                      }}
                    >
                      {Math.round((item.total / item.budget) * 100)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
