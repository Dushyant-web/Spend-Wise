"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Brain,
  Trophy,
  Bell,
  BarChart3,
  Sparkles,
  Zap,
  ShieldCheck,
} from "lucide-react";

export default function FeaturesBento() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[#00D4AA] text-sm font-semibold uppercase tracking-widest mb-3">
            What's inside
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-[#6C63FF] to-[#00D4AA] bg-clip-text text-transparent">
              spend smarter
            </span>
          </h2>
          <p className="text-gray-400 mt-3 max-w-xl mx-auto">
            No fluff. Just the tools that actually help a college student stay on budget.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[180px]">
          {/* AI Predictions — large */}
          <BentoCard className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-[#6C63FF]/10 via-[#13131A] to-[#13131A]">
            <div className="relative h-full flex flex-col justify-between p-6 sm:p-8">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#6C63FF]/15 border border-[#6C63FF]/30 flex items-center justify-center mb-4">
                  <Brain className="w-5 h-5 text-[#A78BFA]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  AI predicts your spending before it happens
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                  Linear regression on your real data forecasts the month's total and flags categories
                  trending over budget. Z-score anomaly detection surfaces unusual spikes.
                </p>
              </div>

              {/* Mini forecast graph */}
              <div className="relative mt-6">
                <svg viewBox="0 0 400 80" className="w-full h-20">
                  <defs>
                    <linearGradient id="bentoLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6C63FF" />
                      <stop offset="100%" stopColor="#A78BFA" />
                    </linearGradient>
                    <linearGradient id="bentoFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#6C63FF" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,55 C40,50 80,45 120,40 C160,30 200,38 240,28 C280,20 320,15 360,10 C380,8 400,6 400,6 L400,80 L0,80 Z"
                    fill="url(#bentoFill)"
                  />
                  <path
                    d="M0,55 C40,50 80,45 120,40 C160,30 200,38 240,28 C280,20 320,15 360,10 C380,8 400,6 400,6"
                    stroke="url(#bentoLine)"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <line x1="240" y1="0" x2="240" y2="80" stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                  <text x="246" y="14" fill="#A78BFA" fontSize="10" fontFamily="ui-sans-serif">
                    forecast →
                  </text>
                </svg>
              </div>
            </div>
          </BentoCard>

          {/* Gamification */}
          <BentoCard className="bg-gradient-to-br from-[#FFB347]/10 via-[#13131A] to-[#13131A]">
            <div className="p-6 h-full flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FFB347]/15 border border-[#FFB347]/30 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-[#FFB347]" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1.5">XP, streaks & 16 badges</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Level up from Broke Freshman to Wealth Architect.
                </p>
              </div>
            </div>
          </BentoCard>

          {/* Smart alerts */}
          <BentoCard className="bg-gradient-to-br from-[#FF6B6B]/10 via-[#13131A] to-[#13131A]">
            <div className="p-6 h-full flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B6B]/15 border border-[#FF6B6B]/30 flex items-center justify-center">
                <Bell className="w-4 h-4 text-[#FF6B6B]" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1.5">Smart budget alerts</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Notifications at 70% and 90% of your monthly limit.
                </p>
              </div>
            </div>
          </BentoCard>

          {/* Analytics — wide */}
          <BentoCard className="md:col-span-2 bg-gradient-to-br from-[#00D4AA]/10 via-[#13131A] to-[#13131A]">
            <div className="p-6 h-full flex items-center gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#00D4AA]/15 border border-[#00D4AA]/30 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#00D4AA]" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">Deep analytics</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Donut charts, monthly trends, daily heatmaps, and merchant breakdowns — all in one view.
                </p>
              </div>
              <div className="hidden sm:flex items-end gap-1 h-16">
                {[24, 38, 18, 52, 30, 60, 42].map((h, i) => (
                  <div
                    key={i}
                    className="w-2 rounded-t bg-gradient-to-t from-[#00D4AA] to-[#A78BFA]"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </BentoCard>

          {/* AI Coach */}
          <BentoCard className="bg-gradient-to-br from-[#A78BFA]/10 via-[#13131A] to-[#13131A]">
            <div className="p-6 h-full flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/15 border border-[#A78BFA]/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#A78BFA]" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1.5">AI Coach chat</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Ask anything: "Where is my money going?" Get answers grounded in your data.
                </p>
              </div>
            </div>
          </BentoCard>

          {/* Speed */}
          <BentoCard className="bg-gradient-to-br from-[#34D399]/10 via-[#13131A] to-[#13131A]">
            <div className="p-6 h-full flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#34D399]/15 border border-[#34D399]/30 flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#34D399]" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1.5">2-tap expense entry</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Pick category, enter amount, done. Under 5 seconds, every time.
                </p>
              </div>
            </div>
          </BentoCard>

          {/* Privacy */}
          <BentoCard className="bg-gradient-to-br from-[#6C63FF]/10 via-[#13131A] to-[#13131A]">
            <div className="p-6 h-full flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#6C63FF]/15 border border-[#6C63FF]/30 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-[#6C63FF]" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1.5">Your data, your call</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  No bank links, no SMS scraping. Encrypted at rest. Export or delete anytime.
                </p>
              </div>
            </div>
          </BentoCard>

          {/* Trends */}
          <BentoCard className="bg-gradient-to-br from-[#FFB347]/10 via-[#13131A] to-[#13131A]">
            <div className="p-6 h-full flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FFB347]/15 border border-[#FFB347]/30 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#FFB347]" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1.5">Month-over-month</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Compare any two months side-by-side. Spot patterns instantly.
                </p>
              </div>
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}

function BentoCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`group relative rounded-2xl border border-white/[0.06] hover:border-white/[0.14] overflow-hidden transition-colors ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_var(--x,50%)_var(--y,0%),rgba(255,255,255,0.06),transparent_60%)]" />
      {children}
    </motion.div>
  );
}
