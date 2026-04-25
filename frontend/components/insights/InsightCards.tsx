"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useInsights } from "@/hooks/useNotifications";
import AIInsightModal from "@/components/modals/AIInsightModal";
import type { InsightCard } from "@/types/notification";

const SEVERITY_STYLES: Record<string, string> = {
  error: "border-red-400/20 bg-red-400/5",
  warning: "border-yellow-400/20 bg-yellow-400/5",
  success: "border-secondary/20 bg-secondary/5",
  info: "border-primary/20 bg-primary/5",
};

const SEVERITY_BADGE: Record<string, string> = {
  error: "bg-red-400/10 text-red-400",
  warning: "bg-yellow-400/10 text-yellow-400",
  success: "bg-secondary/10 text-secondary",
  info: "bg-primary/10 text-primary",
};

function InsightItem({ card, onDismiss, onClick }: { card: InsightCard; onDismiss: () => void; onClick: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      whileHover={{ scale: 1.005 }}
      className={`relative rounded-xl border p-4 cursor-pointer ${SEVERITY_STYLES[card.severity] ?? SEVERITY_STYLES.info}`}
      onClick={onClick}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        className="absolute top-3 right-3 text-gray-600 hover:text-gray-400 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <div className="flex items-start gap-3 pr-8">
        <span className="text-xl flex-shrink-0">{card.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-white">{card.title}</p>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${SEVERITY_BADGE[card.severity]}`}>
              {card.severity}
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed truncate">{card.body}</p>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-gray-700 flex-shrink-0 mt-0.5" />
      </div>
    </motion.div>
  );
}

interface Props {
  limit?: number;
}

export default function InsightCards({ limit = 3 }: Props) {
  const { data, isLoading } = useInsights();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [selectedInsight, setSelectedInsight] = useState<InsightCard | null>(null);

  if (isLoading) return (
    <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
      <Loader2 className="w-4 h-4 animate-spin" /> Generating insights…
    </div>
  );

  const visible = (data ?? []).filter((c) => !dismissed.has(c.id)).slice(0, limit);
  if (!visible.length) return null;

  return (
    <>
      <AnimatePresence>
        <div className="space-y-2">
          {visible.map((card) => (
            <InsightItem
              key={card.id}
              card={card}
              onDismiss={() => setDismissed((prev) => new Set([...prev, card.id]))}
              onClick={() => setSelectedInsight(card)}
            />
          ))}
        </div>
      </AnimatePresence>

      <AIInsightModal
        open={!!selectedInsight}
        onClose={() => setSelectedInsight(null)}
        insight={selectedInsight ? {
          type: selectedInsight.severity === "error" ? "warning" : selectedInsight.severity === "success" ? "positive" : "tip",
          title: selectedInsight.title,
          body: selectedInsight.body,
          priority: selectedInsight.severity,
        } : null}
      />
    </>
  );
}
