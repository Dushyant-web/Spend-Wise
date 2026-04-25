"use client";

import { motion } from "framer-motion";
import { Receipt, Calendar, CreditCard, Tag, FileText, Pencil, Trash2 } from "lucide-react";
import Modal from "./Modal";
import { CATEGORY_MAP } from "@/lib/constants";
import { formatINR } from "@/lib/utils";
import { useUIStore } from "@/stores/uiStore";
import type { Expense } from "@/types/expense";

interface Props {
  open: boolean;
  onClose: () => void;
  expense: Expense | null;
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
}

export default function ExpenseDetailModal({ open, onClose, expense, onEdit, onDelete }: Props) {
  if (!expense) return null;
  const cat = CATEGORY_MAP[expense.category];

  return (
    <Modal open={open} onClose={onClose} title="Expense Details" size="sm">
      <div className="p-5 space-y-4">
        {/* Amount hero */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="text-center py-4"
        >
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${cat?.color ?? "#6C63FF"}20` }}
          >
            {cat?.emoji ?? "💰"}
          </div>
          <p className="text-3xl font-bold text-white">{formatINR(expense.amount)}</p>
          <p className="text-sm text-gray-400 mt-1 capitalize">{cat?.label ?? expense.category}</p>
        </motion.div>

        {/* Details list */}
        <div className="space-y-2.5">
          {expense.merchant && (
            <Row icon={<Receipt className="w-3.5 h-3.5" />} label="Merchant" value={expense.merchant} />
          )}
          <Row
            icon={<Calendar className="w-3.5 h-3.5" />}
            label="Date"
            value={new Date(expense.expense_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          />
          <Row icon={<CreditCard className="w-3.5 h-3.5" />} label="Payment" value={expense.payment_mode.toUpperCase()} />
          {expense.note && (
            <Row icon={<FileText className="w-3.5 h-3.5" />} label="Note" value={expense.note} />
          )}
          {expense.tags && expense.tags.length > 0 && (
            <div className="flex items-start gap-2.5 py-2 border-b border-white/5">
              <div className="p-1.5 rounded-lg bg-white/5 text-gray-400 mt-0.5 flex-shrink-0">
                <Tag className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {expense.tags.map((t: string) => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="flex gap-2 pt-2">
            {onEdit && (
              <button
                onClick={() => { onEdit(expense); onClose(); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-sm transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => { onDelete(expense); onClose(); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-400/10 hover:bg-red-400/20 text-red-400 text-sm transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 py-2 border-b border-white/5">
      <div className="p-1.5 rounded-lg bg-white/5 text-gray-400 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-white truncate">{value}</p>
      </div>
    </div>
  );
}
