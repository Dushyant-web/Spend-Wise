"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { CategoryPrediction } from "@/types/prediction";
import { formatINR } from "@/lib/utils";

interface Props {
  predictions: CategoryPrediction[];
}

const TREND_STYLES = {
  up: { color: "text-red-400", bg: "bg-red-400/10", Icon: TrendingUp },
  down: { color: "text-secondary", bg: "bg-secondary/10", Icon: TrendingDown },
  stable: { color: "text-gray-400", bg: "bg-white/5", Icon: Minus },
};

export default function CategoryForecast({ predictions }: Props) {
  if (!predictions.length) return (
    <p className="text-gray-500 text-sm text-center py-6">Not enough data yet.</p>
  );

  const maxAmount = Math.max(...predictions.map((p) => p.predicted_amount), 1);

  return (
    <div className="space-y-3">
      {predictions.slice(0, 7).map((p, i) => {
        const { color, bg, Icon } = TREND_STYLES[p.trend];
        const barWidth = (p.predicted_amount / maxAmount) * 100;

        return (
          <motion.div
            key={p.category}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3"
          >
            <span className="text-xl w-7 text-center flex-shrink-0">{p.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-300 capitalize">{p.category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">avg {formatINR(p.avg_last_3_months)}</span>
                  <span className="text-sm font-semibold text-white tabular-nums">
                    {formatINR(p.predicted_amount)}
                  </span>
                  <span className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${color} ${bg}`}>
                    <Icon className="w-3 h-3" />
                    {Math.abs(p.trend_pct).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.6, delay: i * 0.04 }}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
