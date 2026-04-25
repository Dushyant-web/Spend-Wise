"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { useDeleteExpense } from "@/hooks/useExpenses";
import { CATEGORY_MAP, PAYMENT_MODES } from "@/lib/constants";
import type { Expense, PaginatedExpenseResponse } from "@/types/expense";

interface Props {
  data: PaginatedExpenseResponse;
  page: number;
  onPageChange: (p: number) => void;
  onEdit: (expense: Expense) => void;
  onRowClick?: (expense: Expense) => void;
}

function formatINR(amount: string | number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ExpenseList({ data, page, onPageChange, onEdit, onRowClick }: Props) {
  const { mutate: deleteExpense } = useDeleteExpense();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteExpense(id, {
      onSuccess: () => {
        toast.success("Expense deleted");
        setDeletingId(null);
      },
      onError: () => {
        toast.error("Failed to delete");
        setDeletingId(null);
      },
    });
  };

  if (!data.items.length) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-4xl mb-3">💸</p>
        <p className="font-medium text-white">No expenses yet</p>
        <p className="text-sm mt-1">Add your first expense to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {data.items.map((expense) => {
          const cat = CATEGORY_MAP[expense.category];
          return (
            <motion.div
              key={expense.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={() => onRowClick?.(expense)}
              className={`flex items-center gap-3 p-3.5 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-colors group ${onRowClick ? "cursor-pointer" : ""}`}
            >
              {/* Category icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: `${cat?.color}20` }}
              >
                {cat?.emoji ?? "💰"}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {expense.merchant || cat?.label || expense.category}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500">{formatDate(expense.expense_date)}</span>
                  <span className="text-xs text-gray-600">·</span>
                  <span className="text-xs text-gray-500 capitalize">{expense.payment_mode}</span>
                  {expense.note && (
                    <>
                      <span className="text-xs text-gray-600">·</span>
                      <span className="text-xs text-gray-500 truncate max-w-[150px]">{expense.note}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white tabular-nums">
                  {formatINR(expense.amount)}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(expense)}
                    className="p-1.5 text-gray-500 hover:text-primary rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    disabled={deletingId === expense.id}
                    className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-400/10 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Pagination */}
      {data.pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * data.per_page + 1}–
            {Math.min(page * data.per_page, data.total)} of {data.total}
          </p>
          <div className="flex gap-1">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-sm text-white rounded-lg bg-white/5">
              {page} / {data.pages}
            </span>
            <button
              disabled={page >= data.pages}
              onClick={() => onPageChange(page + 1)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
