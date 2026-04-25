"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useMyAchievements, useAllBadges } from "@/hooks/useAchievements";
import XPProgressBar from "@/components/achievements/XPProgressBar";
import BadgeCard from "@/components/achievements/BadgeCard";
import AchievementDetailModal from "@/components/modals/AchievementDetailModal";
import type { BadgeDefinition } from "@/types/achievement";

const TrophyScene = dynamic(() => import("@/components/three/TrophyScene"), { ssr: false });

const CATEGORIES = [
  { key: "all",     label: "All" },
  { key: "streak",  label: "🔥 Streak" },
  { key: "expense", label: "📝 Tracking" },
  { key: "budget",  label: "🎯 Budget" },
  { key: "special", label: "⭐ Special" },
];

export default function AchievementsPage() {
  const { data: myData, isLoading: loadingMe } = useMyAchievements();
  const { data: allData, isLoading: loadingAll } = useAllBadges();
  const [activeCategory, setActiveCategory] = useState("all");
  const [showEarnedOnly, setShowEarnedOnly] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<{ badge: BadgeDefinition; earned: boolean; earnedAt?: string } | null>(null);

  const loading = loadingMe || loadingAll;

  const earnedMap = new Map<string, string>(
    (myData?.earned ?? []).map((a) => [a.badge_id, a.earned_at])
  );
  const earnedIds = new Set(allData?.earned_ids ?? []);

  const filtered = (allData?.badges ?? []).filter((b: BadgeDefinition) => {
    if (activeCategory !== "all" && b.category !== activeCategory) return false;
    if (showEarnedOnly && !earnedIds.has(b.badge_id)) return false;
    return true;
  });

  const earnedCount = earnedIds.size;
  const totalCount = allData?.badges.length ?? 0;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 lg:px-8 space-y-4">
        <div className="skeleton" style={{ height: 130, borderRadius: 16 }} />
        <div className="skeleton" style={{ height: 80, borderRadius: 16 }} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12 }} />
          ))}
        </div>
      </div>
    );
  }

  const rarityColors: Record<string, string> = {
    common: "var(--text-tertiary)", rare: "#60A5FA", epic: "var(--accent)", legendary: "#F59E0B",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 pb-24 lg:pb-8 space-y-5">

      {/* Hero with TrophyScene */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl flex items-center justify-between"
        style={{
          background: "var(--bg-base)", border: "1px solid var(--border-subtle)",
          padding: "20px 24px", minHeight: 110,
        }}
      >
        <div style={{
          position: "absolute", inset: 0, opacity: 0.07,
          background: "radial-gradient(ellipse at 80% 50%, #F59E0B, transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative" }}>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.813rem" }}>Your milestones</p>
          <h1 className="font-display font-bold mt-0.5" style={{ color: "var(--text-primary)", fontSize: "1.4rem", letterSpacing: "-0.02em" }}>
            Achievements
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.813rem", marginTop: 4 }}>
            {earnedCount} / {totalCount} badges earned · click any badge to view details
          </p>
        </div>
        <div style={{ width: 100, height: 100, pointerEvents: "none", position: "relative", zIndex: 1 }} className="hidden sm:block">
          <TrophyScene />
        </div>
      </motion.div>

      {/* XP Bar */}
      {myData && (
        <XPProgressBar
          totalXp={myData.total_xp}
          currentLevel={myData.current_level}
          xpToNext={myData.xp_to_next_level}
          levelName={myData.level_name}
          streak={myData.current_streak}
          longestStreak={myData.longest_streak}
        />
      )}

      {/* Progress summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{
          background: "var(--bg-base)", border: "1px solid var(--border-subtle)",
          borderRadius: 16, padding: "20px 24px",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <p style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 600 }}>Overall Progress</p>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.875rem" }}>{earnedCount}/{totalCount}</p>
        </div>
        <div style={{ height: 6, background: "var(--bg-overlay)", borderRadius: 99, overflow: "hidden" }}>
          <motion.div
            style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, var(--success), var(--accent))" }}
            initial={{ width: 0 }}
            animate={{ width: totalCount > 0 ? `${(earnedCount / totalCount) * 100}%` : "0%" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          {(["common", "rare", "epic", "legendary"] as const).map((r) => {
            const total = allData?.badges.filter((b) => b.rarity === r).length ?? 0;
            const earned = allData?.badges.filter((b) => b.rarity === r && earnedIds.has(b.badge_id)).length ?? 0;
            return (
              <motion.div
                key={r}
                whileHover={{ scale: 1.05 }}
                style={{ background: "var(--bg-overlay)", borderRadius: 10, padding: "8px 4px" }}
              >
                <p style={{ fontWeight: 700, fontSize: "0.875rem", color: rarityColors[r] }}>{earned}/{total}</p>
                <p style={{ color: "var(--text-tertiary)", fontSize: "0.625rem", marginTop: 3, textTransform: "capitalize" }}>{r}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1 no-scrollbar">
          {CATEGORIES.map((c) => (
            <motion.button
              key={c.key}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveCategory(c.key)}
              className="whitespace-nowrap transition-all"
              style={{
                padding: "6px 14px", borderRadius: 99, fontSize: "0.813rem", fontWeight: 500,
                background: activeCategory === c.key ? "var(--accent)" : "var(--bg-overlay)",
                color: activeCategory === c.key ? "#fff" : "var(--text-secondary)",
                border: "1px solid",
                borderColor: activeCategory === c.key ? "transparent" : "var(--border-subtle)",
              }}
            >
              {c.label}
            </motion.button>
          ))}
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowEarnedOnly((v) => !v)}
          className="whitespace-nowrap transition-all"
          style={{
            padding: "6px 14px", borderRadius: 99, fontSize: "0.813rem", fontWeight: 500,
            background: showEarnedOnly ? "rgba(16,201,143,0.1)" : "var(--bg-overlay)",
            color: showEarnedOnly ? "var(--success)" : "var(--text-secondary)",
            border: `1px solid ${showEarnedOnly ? "rgba(16,201,143,0.3)" : "var(--border-subtle)"}`,
          }}
        >
          Earned only
        </motion.button>
      </div>

      {/* Badge Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--text-tertiary)" }}>
          <p className="text-3xl mb-3">🏅</p>
          <p>No badges match this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.map((badge, i) => (
            <BadgeCard
              key={badge.badge_id}
              badge={badge}
              earned={earnedIds.has(badge.badge_id)}
              earnedAt={earnedMap.get(badge.badge_id)}
              index={i}
              onClick={() => setSelectedBadge({
                badge,
                earned: earnedIds.has(badge.badge_id),
                earnedAt: earnedMap.get(badge.badge_id),
              })}
            />
          ))}
        </div>
      )}

      <AchievementDetailModal
        open={!!selectedBadge}
        onClose={() => setSelectedBadge(null)}
        badge={selectedBadge?.badge ?? null}
        earned={selectedBadge?.earned ?? false}
        earnedAt={selectedBadge?.earnedAt}
      />
    </div>
  );
}
