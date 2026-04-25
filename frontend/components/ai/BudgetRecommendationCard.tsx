"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import type { BudgetRecommendation } from "@/types/prediction";
import { useApplyRecommendedBudget } from "@/hooks/usePredictions";
import { formatINR } from "@/lib/utils";
import { CATEGORY_MAP } from "@/lib/constants";

interface Props {
  rec: BudgetRecommendation;
}

export default function BudgetRecommendationCard({ rec }: Props) {
  const { mutateAsync, isPending } = useApplyRecommendedBudget();
  const [applied, setApplied] = useState(false);

  const handleApply = async () => {
    try {
      await mutateAsync({
        monthly_limit: rec.recommended_limit,
        category_limits: rec.category_limits,
      });
      setApplied(true);
      toast.success("Budget updated with AI recommendation!");
    } catch {
      toast.error("Failed to apply budget");
    }
  };

  const topCategories = Object.entries(rec.category_limits)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Recommended total */}
      <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">AI Recommended Monthly Budget</p>
          <p className="text-3xl font-bold text-white">{formatINR(rec.recommended_limit)}</p>
          <p className="text-xs text-gray-500 mt-1">
            Based on {rec.based_on_months} month{rec.based_on_months !== 1 ? "s" : ""} · median {formatINR(rec.median_spending)} · +{rec.safety_buffer_pct}% buffer
          </p>
        </div>
        <Sparkles className="w-8 h-8 text-primary opacity-60 flex-shrink-0" />
      </div>

      {/* Category limits */}
      {topCategories.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Suggested category limits</p>
          <div className="space-y-1.5">
            {topCategories.map(([cat, limit]) => {
              const meta = CATEGORY_MAP[cat as keyof typeof CATEGORY_MAP];
              return (
                <div key={cat} className="flex items-center justify-between text-sm">
                  <span className="text-gray-300 flex items-center gap-1.5">
                    <span>{meta?.emoji ?? "💰"}</span>
                    <span className="capitalize">{cat}</span>
                  </span>
                  <span className="font-medium text-white tabular-nums">{formatINR(limit)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Apply button */}
      <motion.button
        onClick={handleApply}
        disabled={isPending || applied}
        whileHover={{ scale: applied ? 1 : 1.01 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
          applied
            ? "bg-secondary/10 text-secondary border border-secondary/20 cursor-default"
            : "bg-primary hover:bg-primary/90 text-white"
        } disabled:opacity-60`}
      >
        {isPending ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Applying…</>
        ) : applied ? (
          <><CheckCircle2 className="w-4 h-4" /> Budget Applied!</>
        ) : (
          <><Sparkles className="w-4 h-4" /> Apply AI Recommendation</>
        )}
      </motion.button>
    </div>
  );
}
