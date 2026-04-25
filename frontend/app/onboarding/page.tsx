"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, Wallet } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

const schema = z.object({
  monthly_income: z.coerce.number().min(0, "Income must be 0 or more"),
  monthly_limit: z.coerce.number().positive("Budget limit must be greater than 0"),
});

type FormValues = z.infer<typeof schema>;

export default function OnboardingPage() {
  const router = useRouter();
  const { updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { monthly_income: 0, monthly_limit: 5000 },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/users/me/onboarding", {
        monthly_income: values.monthly_income,
        monthly_limit: values.monthly_limit,
      });
      updateUser({ onboarding_done: true });
      toast.success("Welcome to SpendWise AI! 🎉");
      router.push("/dashboard");
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      const msg = Array.isArray(detail)
        ? detail.map((d: any) => d.msg).join(", ")
        : (detail ?? "Something went wrong");
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card rounded-2xl p-8 border border-white/10 bg-surface-dark">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold text-white">SpendWise AI</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Let's set you up</h1>
          <p className="text-gray-500 text-sm mb-6">
            Just a few details to personalize your experience
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Monthly Income (₹)</label>
              <input
                {...register("monthly_income")}
                type="number"
                step="100"
                placeholder="e.g. 10000"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50"
              />
              {errors.monthly_income && (
                <p className="text-red-400 text-xs mt-1">{errors.monthly_income.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Monthly Budget Limit (₹)</label>
              <input
                {...register("monthly_limit")}
                type="number"
                step="100"
                placeholder="e.g. 8000"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50"
              />
              {errors.monthly_limit && (
                <p className="text-red-400 text-xs mt-1">{errors.monthly_limit.message}</p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Setting up…</>
              ) : (
                "Get Started →"
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
