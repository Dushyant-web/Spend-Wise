"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useUpdateExpense } from "@/hooks/useExpenses";
import { CATEGORIES, PAYMENT_MODES } from "@/lib/constants";
import type { Category, Expense, PaymentMode } from "@/types/expense";

const schema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  category: z.string().min(1) as z.ZodType<Category>,
  payment_mode: z.string() as z.ZodType<PaymentMode>,
  merchant: z.string().optional(),
  note: z.string().optional(),
  expense_date: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  expense: Expense;
  open: boolean;
  onClose: () => void;
}

export default function EditExpenseModal({ expense, open, onClose }: Props) {
  const { mutateAsync, isPending } = useUpdateExpense();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: Number(expense.amount),
      category: expense.category,
      payment_mode: expense.payment_mode,
      merchant: expense.merchant ?? "",
      note: expense.note ?? "",
      expense_date: expense.expense_date,
    },
  });

  useEffect(() => {
    reset({
      amount: Number(expense.amount),
      category: expense.category,
      payment_mode: expense.payment_mode,
      merchant: expense.merchant ?? "",
      note: expense.note ?? "",
      expense_date: expense.expense_date,
    });
  }, [expense, reset]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const onSubmit = async (values: FormValues) => {
    try {
      await mutateAsync({
        id: expense.id,
        amount: values.amount,
        category: values.category,
        payment_mode: values.payment_mode,
        merchant: values.merchant || undefined,
        note: values.note || undefined,
        expense_date: values.expense_date,
      });
      toast.success("Expense updated!");
      onClose();
    } catch {
      toast.error("Failed to update expense");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
            style={{
              background: "rgba(8, 6, 14, 0.72)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              borderRadius: "20px 20px 0 0",
              boxShadow: "0 -20px 60px rgba(0,0,0,0.5), 0 0 0 1px var(--border-subtle) inset",
              paddingBottom: "max(env(safe-area-inset-bottom), 16px)",
            }}
          >
            {/* Drag handle (mobile) */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 999,
                  background: "var(--border-strong)",
                }}
              />
            </div>

            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <h2
                className="font-display"
                style={{ color: "var(--text-primary)", fontSize: "1.125rem", fontWeight: 600, letterSpacing: "-0.01em" }}
              >
                Edit Expense
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "var(--text-tertiary)" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="px-5 pb-4 space-y-4">
              {/* Amount */}
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                  Amount (₹)
                </label>
                <input
                  {...register("amount")}
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  className="w-full rounded-xl px-3.5 py-3 text-lg font-semibold focus:outline-none"
                  style={{
                    background: "var(--bg-overlay)",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-primary)",
                  }}
                />
                {errors.amount && (
                  <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>
                    {errors.amount.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                  Category
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <label key={cat.value} className="cursor-pointer">
                      <input
                        {...register("category")}
                        type="radio"
                        value={cat.value}
                        className="sr-only peer"
                      />
                      <div
                        className="flex flex-col items-center justify-center p-2 rounded-xl transition-all peer-checked:[&]:cat-active text-center"
                        style={{
                          border: "1px solid var(--border-default)",
                          color: "var(--text-tertiary)",
                          background: "var(--bg-overlay)",
                        }}
                      >
                        <span className="text-lg leading-none">{cat.emoji}</span>
                        <span className="text-[10px] mt-1 leading-tight">
                          {cat.label.split(" ")[0]}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment + Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                    Payment
                  </label>
                  <select
                    {...register("payment_mode")}
                    className="w-full rounded-xl px-3 py-2.5 focus:outline-none appearance-none"
                    style={{
                      background: "var(--bg-overlay)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {PAYMENT_MODES.map((m) => (
                      <option key={m.value} value={m.value} style={{ background: "var(--bg-elevated)" }}>
                        {m.icon} {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                    Date
                  </label>
                  <input
                    {...register("expense_date")}
                    type="date"
                    className="w-full rounded-xl px-3 py-2.5 focus:outline-none"
                    style={{
                      background: "var(--bg-overlay)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>

              {/* Merchant */}
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                  Merchant
                </label>
                <input
                  {...register("merchant")}
                  type="text"
                  placeholder="e.g. Swiggy"
                  className="w-full rounded-xl px-3 py-2.5 focus:outline-none"
                  style={{
                    background: "var(--bg-overlay)",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              {/* Note */}
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                  Note
                </label>
                <input
                  {...register("note")}
                  type="text"
                  placeholder="Any description"
                  className="w-full rounded-xl px-3 py-2.5 focus:outline-none"
                  style={{
                    background: "var(--bg-overlay)",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <motion.button
                type="submit"
                disabled={isPending}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
                  color: "#fff",
                  boxShadow: "0 8px 24px var(--accent-glow)",
                }}
              >
                {isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                ) : (
                  "Save Changes"
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
