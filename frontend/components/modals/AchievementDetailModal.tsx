"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Trophy, Star, Lock } from "lucide-react";
import Modal from "./Modal";
import type { BadgeDefinition } from "@/types/achievement";

interface Props {
  open: boolean;
  onClose: () => void;
  badge: BadgeDefinition | null;
  earned: boolean;
  earnedAt?: string;
}

const RARITY_COLORS: Record<string, string> = {
  common: "from-gray-500 to-gray-400",
  rare: "from-blue-500 to-blue-400",
  epic: "from-purple-500 to-purple-400",
  legendary: "from-yellow-500 to-amber-400",
};

const RARITY_GLOW: Record<string, string> = {
  common: "shadow-gray-500/20",
  rare: "shadow-blue-500/30",
  epic: "shadow-purple-500/40",
  legendary: "shadow-yellow-500/50",
};

export default function AchievementDetailModal({ open, onClose, badge, earned, earnedAt }: Props) {
  if (!badge) return null;
  const rarity = badge.rarity ?? "common";
  const gradient = RARITY_COLORS[rarity] ?? RARITY_COLORS.common;
  const glow = RARITY_GLOW[rarity] ?? RARITY_GLOW.common;

  return (
    <Modal open={open} onClose={onClose} hideHeader size="sm">
      <div className="p-6 text-center space-y-4">
        {/* Badge icon */}
        <div className="relative inline-block">
          {earned && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, rotate: i * 45 }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0], y: [0, -40] }}
                  transition={{ delay: i * 0.06, duration: 0.8 }}
                  className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-yellow-400"
                  style={{ transformOrigin: "center", marginLeft: -3, marginTop: -3 }}
                />
              ))}
            </>
          )}
          <motion.div
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center text-4xl shadow-2xl ${glow} mx-auto ${!earned ? "opacity-40 grayscale" : ""}`}
          >
            {badge.emoji}
          </motion.div>
          {earned && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg"
            >
              <Trophy className="w-3.5 h-3.5 text-yellow-900" />
            </motion.div>
          )}
          {!earned && (
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
            </div>
          )}
        </div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h3 className="text-lg font-bold text-white mb-1">{badge.badge_name}</h3>
          <p className="text-sm text-gray-400 mb-3">{badge.description}</p>

          <div className="flex items-center justify-center gap-3 mb-3">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize bg-gradient-to-r ${gradient} text-white`}>
              {rarity}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 flex items-center gap-1">
              <Star className="w-3 h-3" /> {badge.xp} XP
            </span>
          </div>

          {earned && earnedAt ? (
            <p className="text-xs text-secondary font-medium">
              Earned {new Date(earnedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          ) : (
            <p className="text-xs text-gray-500">Complete the required actions to unlock</p>
          )}
        </motion.div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
