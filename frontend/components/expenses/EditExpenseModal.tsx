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
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 px-4"
          >
            <div className="glass-card rounded-2xl p-6 border border-white/10 bg-surface-dark">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-white">Edit Expense</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Amount (₹)</label>
                  <input
                    {...register("amount")}
                    type="number"
                    step="0.01"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-primary/50 text-lg font-semibold"
                  />
                  {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount.message}</p>}
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Category</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {CATEGORIES.map((cat) => (
                      <label key={cat.value} className="cursor-pointer">
                        <input {...register("category")} type="radio" value={cat.value} className="sr-only peer" />
                        <div className="flex flex-col items-center justify-center p-2 rounded-lg border border-white/10 text-gray-400 peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-white transition-all hover:border-white/20 text-center">
                          <span className="text-lg leading-none">{cat.emoji}</span>
                          <span className="text-[9px] mt-0.5 leading-tight">{cat.label.split(" ")[0]}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Payment</label>
                    <select {...register("payment_mode")} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-primary/50 appearance-none">
                      {PAYMENT_MODES.map((m) => (
                        <option key={m.value} value={m.value} className="bg-gray-900">{m.icon} {m.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Date</label>
                    <input {...register("expense_date")} type="date" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-primary/50" />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Merchant</label>
                  <input {...register("merchant")} type="text" placeholder="e.g. Swiggy" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50" />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Note</label>
                  <input {...register("note")} type="text" placeholder="Any description" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50" />
                </div>

                <motion.button
                  type="submit"
                  disabled={isPending}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : "Save Changes"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
