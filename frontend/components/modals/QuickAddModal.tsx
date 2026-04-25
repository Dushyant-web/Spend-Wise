"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useCreateExpense } from "@/hooks/useExpenses";
import { CATEGORIES, PAYMENT_MODES } from "@/lib/constants";
import type { Category, PaymentMode } from "@/types/expense";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function QuickAddModal({ open, onClose }: Props) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("food");
  const [merchant, setMerchant] = useState("");
  const [mode, setMode] = useState<PaymentMode>("upi");
  const amountRef = useRef<HTMLInputElement>(null);
  const { mutateAsync, isPending } = useCreateExpense();

  useEffect(() => {
    if (open) {
      setTimeout(() => amountRef.current?.focus(), 80);
      setAmount("");
      setMerchant("");
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!open) return; // handled by layout
      }
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) return;
    try {
      await mutateAsync({
        amount: num,
        category,
        payment_mode: mode,
        merchant: merchant || undefined,
        expense_date: new Date().toISOString().split("T")[0],
      });
      toast.success("Expense added!");
      onClose();
    } catch {
      toast.error("Failed to add expense");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative w-full max-w-md bg-[#0E0E16] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <form onSubmit={submit}>
              {/* Amount input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                <span className="text-2xl font-bold text-gray-500">₹</span>
                <input
                  ref={amountRef}
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="flex-1 bg-transparent text-3xl font-bold text-white placeholder-gray-700 focus:outline-none"
                />
                <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-lg">⌘K</span>
              </div>

              <div className="p-4 space-y-3">
                {/* Merchant */}
                <input
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="Merchant (optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/40"
                />

                {/* Category grid */}
                <div className="grid grid-cols-4 gap-1.5">
                  {CATEGORIES.slice(0, 8).map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCategory(c.value as Category)}
                      className={`py-2 rounded-xl text-center transition-all ${
                        category === c.value
                          ? "bg-primary/20 border border-primary/40"
                          : "bg-white/5 border border-transparent hover:bg-white/10"
                      }`}
                    >
                      <span className="text-lg block">{c.emoji}</span>
                      <span className="text-[10px] text-gray-400 mt-0.5 block truncate px-1">{c.label}</span>
                    </button>
                  ))}
                </div>

                {/* Payment mode */}
                <div className="flex gap-1.5">
                  {PAYMENT_MODES.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMode(m.value as PaymentMode)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        mode === m.value ? "bg-primary text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <motion.button
                  type="submit"
                  disabled={!amount || isPending}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 transition-colors"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {isPending ? "Adding…" : "Quick Add"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
