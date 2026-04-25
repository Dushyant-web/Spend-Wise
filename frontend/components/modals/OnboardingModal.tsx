"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, PiggyBank, Target, Zap, ArrowRight, Check } from "lucide-react";
import Modal from "./Modal";

interface Props {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    icon: <Sparkles className="w-8 h-8" />,
    color: "from-primary to-violet-500",
    title: "Welcome to SpendWise AI",
    desc: "Your personal finance companion for college life. Track spending, earn XP, and get AI-powered insights.",
    tip: "Designed for Indian college students",
  },
  {
    icon: <PiggyBank className="w-8 h-8" />,
    color: "from-secondary to-teal-400",
    title: "Track Every Rupee",
    desc: "Log expenses quickly with categories. Use ⌘K (Ctrl+K) anywhere to add an expense in seconds.",
    tip: "Supports UPI, cash, card & more",
  },
  {
    icon: <Target className="w-8 h-8" />,
    color: "from-accent to-orange-400",
    title: "Set Monthly Budgets",
    desc: "Define your monthly limit and get alerts when you're approaching it. Per-category tracking included.",
    tip: "Rollover unused budget month-to-month",
  },
  {
    icon: <Zap className="w-8 h-8" />,
    color: "from-yellow-500 to-amber-400",
    title: "Level Up & Earn Badges",
    desc: "Every expense logged earns XP. Maintain daily streaks, unlock achievements, and climb the levels.",
    tip: "30+ badges to collect",
  },
];

export default function OnboardingModal({ open, onClose }: Props) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <Modal open={open} onClose={onClose} hideHeader size="sm">
      <div className="p-6">
        {/* Step visual */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="text-center space-y-4 mb-6"
          >
            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${current.color} flex items-center justify-center text-white mx-auto shadow-2xl`}>
              {current.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">{current.title}</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{current.desc}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-white/5 px-3 py-1.5 rounded-full">
              <Check className="w-3 h-3 text-secondary" /> {current.tip}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-primary" : "w-1.5 bg-white/20"}`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-colors"
            >
              Back
            </button>
          )}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => isLast ? onClose() : setStep((s) => s + 1)}
            className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            {isLast ? "Get Started" : (<>Next <ArrowRight className="w-3.5 h-3.5" /></>)}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}
