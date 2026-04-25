"use client";

import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import Modal from "./Modal";

interface Insight {
  type?: string;
  title: string;
  body: string;
  action?: string;
  priority?: string;
  category?: string;
  amount?: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  insight: Insight | null;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  warning: <AlertTriangle className="w-5 h-5" />,
  positive: <CheckCircle className="w-5 h-5" />,
  tip: <Lightbulb className="w-5 h-5" />,
  trend_up: <TrendingUp className="w-5 h-5" />,
  trend_down: <TrendingDown className="w-5 h-5" />,
};

const COLOR_MAP: Record<string, string> = {
  warning: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  positive: "text-secondary bg-secondary/10 border-secondary/20",
  tip: "text-primary bg-primary/10 border-primary/20",
  trend_up: "text-red-400 bg-red-400/10 border-red-400/20",
  trend_down: "text-secondary bg-secondary/10 border-secondary/20",
};

export default function AIInsightModal({ open, onClose, insight }: Props) {
  if (!insight) return null;
  const type = insight.type ?? "tip";
  const icon = ICON_MAP[type] ?? ICON_MAP.tip;
  const colorCls = COLOR_MAP[type] ?? COLOR_MAP.tip;

  return (
    <Modal open={open} onClose={onClose} size="md" hideHeader>
      <div className="p-6 space-y-4">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto ${colorCls}`}
        >
          {icon}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="text-lg font-bold text-white text-center mb-2">{insight.title}</h3>
          <p className="text-sm text-gray-300 text-center leading-relaxed">{insight.body}</p>
        </motion.div>

        {/* Meta */}
        <div className="flex flex-wrap justify-center gap-2">
          {insight.category && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 capitalize">
              {insight.category}
            </span>
          )}
          {insight.priority && (
            <span className={`text-xs px-2.5 py-1 rounded-full border capitalize ${colorCls}`}>
              {insight.priority} priority
            </span>
          )}
        </div>

        {/* Action tip */}
        {insight.action && (
          <div className="bg-white/5 border border-white/5 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Suggested Action</p>
            <p className="text-sm text-gray-200">{insight.action}</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-medium transition-colors"
        >
          Got it
        </button>
      </div>
    </Modal>
  );
}
