"use client";

import { motion } from "framer-motion";
import Modal from "./Modal";
import { CATEGORY_MAP } from "@/lib/constants";
import type { Category } from "@/types/expense";
import { formatINR } from "@/lib/utils";

interface CategorySpend {
  category: string;
  spent: number | string;
  budget?: number | string;
  percentage?: number;
  transaction_count?: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  category: CategorySpend | null;
  monthName?: string;
}

export default function CategoryDetailModal({ open, onClose, category, monthName }: Props) {
  if (!category) return null;
  const cat = CATEGORY_MAP[category.category as Category];
  const pct = category.percentage ?? 0;
  const hasBudget = category.budget && Number(category.budget) > 0;

  return (
    <Modal open={open} onClose={onClose} title={`${cat?.label ?? category.category} Breakdown`} size="sm">
      <div className="p-5 space-y-5">
        {/* Hero */}
        <div className="text-center py-3">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl"
            style={{ backgroundColor: `${cat?.color ?? "#6C63FF"}20` }}
          >
            {cat?.emoji ?? "💰"}
          </div>
          <p className="text-xs text-gray-500 mb-1">{monthName ?? "This month"}</p>
          <p className="text-3xl font-bold text-white">{formatINR(category.spent)}</p>
          {category.transaction_count !== undefined && (
            <p className="text-sm text-gray-400 mt-1">{category.transaction_count} transactions</p>
          )}
        </div>

        {/* Budget progress */}
        {hasBudget && (
          <div className="bg-white/5 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Budget usage</span>
              <span className={`font-medium ${pct >= 100 ? "text-red-400" : pct >= 75 ? "text-yellow-400" : "text-secondary"}`}>
                {pct.toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(pct, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${pct >= 100 ? "bg-red-500" : pct >= 75 ? "bg-yellow-500" : "bg-secondary"}`}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Spent {formatINR(category.spent)}</span>
              <span>Budget {formatINR(category.budget!)}</span>
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Spent</p>
            <p className="text-base font-bold text-white">{formatINR(category.spent)}</p>
          </div>
          {hasBudget ? (
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Remaining</p>
              <p className={`text-base font-bold ${Number(category.budget) - Number(category.spent) < 0 ? "text-red-400" : "text-secondary"}`}>
                {formatINR(Math.max(0, Number(category.budget) - Number(category.spent)))}
              </p>
            </div>
          ) : (
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Transactions</p>
              <p className="text-base font-bold text-white">{category.transaction_count ?? "—"}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
