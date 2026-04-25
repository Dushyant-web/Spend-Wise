"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import type { AnomalyItem } from "@/types/prediction";
import { formatINR } from "@/lib/utils";

interface Props {
  anomalies: AnomalyItem[];
}

export default function AnomalyDetection({ anomalies }: Props) {
  if (!anomalies.length) return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <span className="text-3xl mb-2">✅</span>
      <p className="text-sm text-white font-medium">No anomalies detected</p>
      <p className="text-xs text-gray-500 mt-0.5">Your spending patterns look normal.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {anomalies.map((item, i) => (
        <motion.div
          key={item.expense_id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-start gap-3 p-3.5 rounded-xl bg-red-400/5 border border-red-400/15"
        >
          <div className="w-9 h-9 rounded-xl bg-red-400/10 flex items-center justify-center text-lg flex-shrink-0">
            {item.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-white capitalize">
                  {item.merchant ?? item.category}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  {" · "}avg in category: {formatINR(item.category_avg)}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-white">{formatINR(item.amount)}</p>
                <span className="text-xs text-red-400 font-medium">
                  +{item.deviation_pct.toFixed(0)}% above avg
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
