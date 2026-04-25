"use client";

import { motion } from "framer-motion";

interface XPProgressBarProps {
  totalXp: number;
  currentLevel: number;
  xpToNext: number;
  levelName: string;
  streak: number;
  longestStreak: number;
}

const RANK_COLORS: Record<string, string> = {
  bronze: "from-amber-700 to-amber-500",
  silver: "from-slate-400 to-slate-300",
  gold: "from-yellow-500 to-yellow-300",
  platinum: "from-cyan-400 to-cyan-200",
};

export default function XPProgressBar({
  totalXp,
  currentLevel,
  xpToNext,
  levelName,
  streak,
  longestStreak,
}: XPProgressBarProps) {
  const xpInLevel = totalXp % 100;
  const progress = xpInLevel / 100;

  return (
    <div className="bg-surface-dark rounded-2xl p-6 border border-white/5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
              {currentLevel}
            </div>
            <div>
              <p className="text-white font-bold text-xl">{levelName}</p>
              <p className="text-gray-400 text-sm">Level {currentLevel}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white font-bold text-2xl">{totalXp.toLocaleString()}</p>
          <p className="text-gray-400 text-sm">Total XP</p>
        </div>
      </div>

      <div className="mb-1 flex justify-between text-xs text-gray-400">
        <span>{xpInLevel} XP</span>
        <span>{xpToNext} XP to next level</span>
      </div>
      <div className="h-3 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-secondary">🔥 {streak}</p>
          <p className="text-gray-400 text-xs mt-1">Current Streak</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-primary">⚡ {longestStreak}</p>
          <p className="text-gray-400 text-xs mt-1">Longest Streak</p>
        </div>
      </div>
    </div>
  );
}
