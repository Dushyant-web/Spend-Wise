"use client";

import { motion } from "framer-motion";
import type { BadgeDefinition } from "@/types/achievement";

interface BadgeCardProps {
  badge: BadgeDefinition;
  earned: boolean;
  earnedAt?: string;
  index?: number;
  onClick?: () => void;
}

const RARITY_STYLES: Record<string, { border: string; glow: string; label: string }> = {
  common:    { border: "border-gray-600",    glow: "",                              label: "text-gray-400" },
  rare:      { border: "border-blue-500/50", glow: "shadow-blue-500/20 shadow-lg",  label: "text-blue-400" },
  epic:      { border: "border-purple-500/50", glow: "shadow-purple-500/20 shadow-lg", label: "text-purple-400" },
  legendary: { border: "border-yellow-500/50", glow: "shadow-yellow-500/30 shadow-xl", label: "text-yellow-400" },
};

export default function BadgeCard({ badge, earned, earnedAt, index = 0, onClick }: BadgeCardProps) {
  const rarity = RARITY_STYLES[badge.rarity] ?? RARITY_STYLES.common;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative rounded-2xl border p-4 flex flex-col items-center text-center transition-all cursor-pointer
        ${earned
          ? `bg-surface-dark ${rarity.border} ${rarity.glow}`
          : "bg-white/[0.02] border-white/5 opacity-40 grayscale"
        }`}
    >
      {earned && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary animate-pulse" />
      )}

      <div className={`text-4xl mb-3 ${earned ? "" : "opacity-30"}`}>
        {earned ? badge.emoji : "🔒"}
      </div>

      <p className={`font-semibold text-sm mb-1 ${earned ? "text-white" : "text-gray-500"}`}>
        {badge.badge_name}
      </p>

      <p className="text-gray-400 text-xs leading-snug mb-3">{badge.description}</p>

      <div className="flex items-center gap-2 mt-auto">
        <span className={`text-xs font-medium ${rarity.label} capitalize`}>{badge.rarity}</span>
        <span className="text-gray-600">•</span>
        <span className="text-xs text-yellow-400 font-medium">+{badge.xp} XP</span>
      </div>

      {earned && earnedAt && (
        <p className="text-gray-500 text-[10px] mt-2">
          {new Date(earnedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      )}
    </motion.div>
  );
}
