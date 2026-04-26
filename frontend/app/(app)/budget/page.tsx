"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PiggyBank, Calendar, Pencil, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import dynamic from "next/dynamic";
import { useCurrentBudget, useSetBudget, useUpdateBudget, useBudgetHistory } from "@/hooks/useBudget";
import { CATEGORIES, MONTHS } from "@/lib/constants";
import CategoryDetailModal from "@/components/modals/CategoryDetailModal";
import { formatINR } from "@/lib/utils";

const CoinStack3D = dynamic(() => import("@/components/three/CoinStack3D"), { ssr: false });

const budgetSchema = z.object({
  monthly_limit: z.coerce.number().positive("Must be greater than 0"),
  savings_goal: z.coerce.number().min(0).optional(),
  rollover_enabled: z.boolean().optional(),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

function Skeleton({ style = {} }: { style?: React.CSSProperties }) {
  return <div className="skeleton rounded-lg" style={style} />;
}

function ProgressBar({ pct }: { pct: number }) {
  const clamped = Math.min(pct, 100);
  const bg = pct >= 90
    ? "linear-gradient(90deg, var(--danger), #F87171)"
    : pct >= 70
    ? "linear-gradient(90deg, var(--warning), #FCD34D)"
    : "linear-gradient(90deg, var(--accent), #A78BFA)";
  return (
    <div style={{ height: 6, background: "var(--bg-overlay)", borderRadius: 99, overflow: "hidden" }}>
      <motion.div
        style={{ height: "100%", background: bg, borderRadius: 99 }}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

function SetBudgetForm({ isUpdate }: { isUpdate: boolean }) {
  const { mutateAsync: create, isPending: creating } = useSetBudget();
  const { mutateAsync: update, isPending: updating } = useUpdateBudget();
  const isPending = creating || updating;
  const { data: current } = useCurrentBudget();

  const { register, handleSubmit, formState: { errors } } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      monthly_limit: current ? Number(current.monthly_limit) : undefined,
      savings_goal: current ? Number(current.savings_goal) : 0,
      rollover_enabled: current?.rollover_enabled ?? false,
    },
  });

  const onSubmit = async (values: BudgetFormValues) => {
    try {
      if (isUpdate) {
        await update(values);
        toast.success("Budget updated!");
      } else {
        await create({ monthly_limit: values.monthly_limit, savings_goal: values.savings_goal, rollover_enabled: values.rollover_enabled });
        toast.success("Budget set!");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Failed to save budget");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label style={{ color: "var(--text-secondary)", fontSize: "0.813rem", display: "block", marginBottom: 6 }}>
          Monthly Limit (₹)
        </label>
        <input
          {...register("monthly_limit")}
          type="number"
          step="100"
          placeholder="e.g. 15000"
          className="input"
          style={{ fontSize: "1.125rem", fontWeight: 600 }}
        />
        {errors.monthly_limit && (
          <p style={{ color: "var(--danger)", fontSize: "0.75rem", marginTop: 4 }}>
            {errors.monthly_limit.message}
          </p>
        )}
      </div>
      <div>
        <label style={{ color: "var(--text-secondary)", fontSize: "0.813rem", display: "block", marginBottom: 6 }}>
          Savings Goal (₹)
        </label>
        <input
          {...register("savings_goal")}
          type="number"
          step="100"
          placeholder="e.g. 3000"
          className="input"
        />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input {...register("rollover_enabled")} type="checkbox" style={{ accentColor: "var(--accent)" }} />
        <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Enable budget rollover to next month
        </span>
      </label>
      <motion.button
        type="submit"
        disabled={isPending}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="btn btn-primary w-full"
        style={{ height: 44, fontSize: "0.938rem", fontWeight: 600 }}
      >
        {isPending ? "Saving…" : isUpdate ? "Update Budget" : "Set Budget"}
      </motion.button>
    </form>
  );
}

const cardStyle = {
  background: "var(--bg-base)", border: "1px solid var(--border-subtle)",
  borderRadius: 16, padding: "20px 24px",
};

export default function BudgetPage() {
  const { data, isLoading, isError } = useCurrentBudget();
  const { data: history } = useBudgetHistory();
  const [editMode, setEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const today = new Date();
  const monthName = MONTHS[today.getMonth()];

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 lg:px-8 pb-24 lg:pb-8 space-y-4">
        <Skeleton style={{ height: 140, borderRadius: 16 }} />
        <Skeleton style={{ height: 220, borderRadius: 16 }} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-xl mx-auto px-4 lg:px-8 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ ...cardStyle, textAlign: "center", padding: "40px 24px" }}
        >
          {/* 3D scene in empty state */}
          <div style={{ width: 140, height: 140, margin: "0 auto 12px", pointerEvents: "none" }}>
            <CoinStack3D />
          </div>
          <h2
            className="font-display font-bold"
            style={{ color: "var(--text-primary)", fontSize: "1.25rem", marginBottom: 8 }}
          >
            Set Your Budget for {monthName}
          </h2>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.875rem", marginBottom: 24 }}>
            Define your monthly spending limit to start tracking your finances.
          </p>
          <SetBudgetForm isUpdate={false} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 pb-24 lg:pb-8 space-y-5">

      {/* Overview card with 3D */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
        style={{ ...cardStyle }}
      >
        <div style={{
          position: "absolute", inset: 0, opacity: 0.06,
          background: "radial-gradient(ellipse at 85% 50%, var(--accent), transparent 65%)",
          pointerEvents: "none",
        }} />

        <div className="flex items-start justify-between mb-4">
          <div style={{ position: "relative" }}>
            <p style={{ color: "var(--text-tertiary)", fontSize: "0.813rem" }}>
              {monthName} {today.getFullYear()} Budget
            </p>
            <p
              className="font-display font-bold"
              style={{ color: "var(--text-primary)", fontSize: "2rem", marginTop: 4, letterSpacing: "-0.02em" }}
            >
              {formatINR(data.monthly_limit)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* 3D coin stack */}
            <div style={{ width: 80, height: 80, pointerEvents: "none" }} className="hidden sm:block">
              <CoinStack3D />
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setEditMode((v) => !v)}
              className="btn btn-secondary"
              style={{ height: 32, paddingLeft: 12, paddingRight: 12, fontSize: "0.813rem" }}
            >
              <Pencil style={{ width: 13, height: 13 }} /> Edit
            </motion.button>
          </div>
        </div>

        <ProgressBar pct={data.percentage_used} />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            { label: "Spent", value: formatINR(data.spending_so_far), sub: `${data.percentage_used}%`, color: "var(--text-primary)" },
            { label: "Remaining", value: formatINR(data.remaining_budget), sub: "", color: Number(data.remaining_budget) < 0 ? "var(--danger)" : "var(--success)" },
            { label: "Daily Avg", value: formatINR(data.daily_average), sub: `Day ${data.days_elapsed}/${data.days_in_month}`, color: "var(--text-primary)" },
            { label: "Savings Goal", value: formatINR(data.savings_goal), sub: "", color: "var(--accent)" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ background: "var(--bg-overlay)", borderRadius: 10, padding: "10px 12px" }}
            >
              <p style={{ color: "var(--text-tertiary)", fontSize: "0.70rem", marginBottom: 4 }}>{s.label}</p>
              <p style={{ color: s.color, fontWeight: 600, fontSize: "0.938rem" }}>{s.value}</p>
              {s.sub && <p style={{ color: "var(--text-tertiary)", fontSize: "0.70rem", marginTop: 2 }}>{s.sub}</p>}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Edit form */}
      <AnimatePresence>
        {editMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ ...cardStyle, overflow: "hidden" }}
          >
            <h3 style={{ color: "var(--text-primary)", fontSize: "0.938rem", fontWeight: 600, marginBottom: 16 }}>
              Edit Budget
            </h3>
            <SetBudgetForm isUpdate={true} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category breakdown */}
      {data.category_spending.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={cardStyle}
        >
          <h3 style={{ color: "var(--text-primary)", fontSize: "0.938rem", fontWeight: 600, marginBottom: 16 }}>
            Category Breakdown
          </h3>
          <div className="space-y-3">
            {data.category_spending.map((cs, i) => {
              const cat = CATEGORIES.find((c) => c.value === cs.category);
              return (
                <motion.div
                  key={cs.category}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ x: 2 }}
                  onClick={() => setSelectedCategory(cs)}
                  className="rounded-xl cursor-pointer p-2 -mx-2 transition-colors"
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-overlay)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span>{cat?.emoji ?? "💰"}</span>
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }} className="capitalize">
                        {cat?.label ?? cs.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 500 }}>
                        {formatINR(cs.spent)}
                      </span>
                      {cs.budget > 0 && (
                        <span style={{ color: "var(--text-tertiary)", fontSize: "0.75rem" }}>
                          / {formatINR(cs.budget)}
                        </span>
                      )}
                      <ChevronRight style={{ width: 13, height: 13, color: "var(--text-tertiary)" }} />
                    </div>
                  </div>
                  {cs.budget > 0 && <ProgressBar pct={cs.percentage} />}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* History */}
      {history && history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={cardStyle}
        >
          <h3 style={{ color: "var(--text-primary)", fontSize: "0.938rem", fontWeight: 600, marginBottom: 16 }}>
            Budget History
          </h3>
          <div>
            {history.map((item, i) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-3"
                style={{ borderBottom: i < history.length - 1 ? "1px solid var(--border-subtle)" : "none" }}
              >
                <div className="flex items-center gap-2">
                  <Calendar style={{ width: 14, height: 14, color: "var(--text-tertiary)" }} />
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                    {MONTHS[item.month - 1]} {item.year}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div style={{ textAlign: "right" }}>
                    <p style={{ color: "var(--text-primary)", fontSize: "0.875rem" }}>
                      {formatINR(item.actual_spending)}
                    </p>
                    <p style={{ color: "var(--text-tertiary)", fontSize: "0.70rem" }}>
                      of {formatINR(item.monthly_limit)}
                    </p>
                  </div>
                  <span style={{
                    fontSize: "0.70rem", fontWeight: 500, padding: "2px 8px", borderRadius: 99,
                    background: item.percentage_used > 100
                      ? "rgba(240,86,114,0.1)"
                      : item.percentage_used > 80
                      ? "rgba(240,164,41,0.1)"
                      : "rgba(16,201,143,0.1)",
                    color: item.percentage_used > 100
                      ? "var(--danger)"
                      : item.percentage_used > 80
                      ? "var(--warning)"
                      : "var(--success)",
                  }}>
                    {item.percentage_used.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <CategoryDetailModal
        open={!!selectedCategory}
        onClose={() => setSelectedCategory(null)}
        category={selectedCategory}
        monthName={monthName}
      />
    </div>
  );
}
