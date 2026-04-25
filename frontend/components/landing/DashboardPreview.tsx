"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { TrendingUp, IndianRupee, PiggyBank, Target } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const METRICS = [
  { icon: IndianRupee, label: "Total Spent", value: "₹8,420", trend: "+12%", color: "text-[#FF6B6B]" },
  { icon: PiggyBank, label: "Remaining", value: "₹6,580", trend: "44%", color: "text-[#00D4AA]" },
  { icon: TrendingUp, label: "Daily Avg", value: "₹280", trend: "-5%", color: "text-[#6C63FF]" },
  { icon: Target, label: "Streak", value: "12d", trend: "🔥", color: "text-[#FFB347]" },
];

const CATEGORIES = [
  { name: "Food", color: "#FF6B6B", value: 65 },
  { name: "Transport", color: "#4ECDC4", value: 40 },
  { name: "Shopping", color: "#A78BFA", value: 28 },
  { name: "Bills", color: "#FFB347", value: 18 },
];

const CHART_PATH = "M0,80 C40,70 70,55 100,50 C130,45 160,60 200,40 C240,20 270,30 300,25 C340,18 380,12 420,8";

export default function DashboardPreview() {
  const section = useRef<HTMLElement>(null);
  const card = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!card.current) return;
      gsap.set(card.current, { rotateX: 22, rotateY: -4, scale: 0.92, opacity: 0.6 });

      gsap.to(card.current, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: section.current,
          start: "top 90%",
          end: "top 25%",
          scrub: 0.6,
        },
      });
    },
    { scope: section }
  );

  return (
    <section
      ref={section}
      id="preview"
      className="relative py-24 px-4 sm:px-6 overflow-hidden"
      style={{ perspective: "1800px" }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full bg-[#6C63FF]/8 blur-[120px]" />
      </div>

      <div className="relative max-w-6xl mx-auto text-center mb-12">
        <p className="text-[#6C63FF] text-sm font-semibold uppercase tracking-widest mb-3">Dashboard</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
          Every rupee, beautifully visualized.
        </h2>
        <p className="text-gray-400 mt-3 max-w-xl mx-auto">
          A dashboard that doesn't just show numbers — it tells a story about how you spend.
        </p>
      </div>

      <div
        ref={card}
        className="relative max-w-5xl mx-auto rounded-3xl border border-white/[0.08] bg-[#13131A]/95 backdrop-blur-xl shadow-[0_40px_80px_-20px_rgba(108,99,255,0.4)] p-5 sm:p-8"
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      >
        {/* topbar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-gray-500">Hey, Arjun 👋</p>
            <p className="text-lg sm:text-xl font-bold text-white">April 2026 Overview</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#00D4AA]" />
          </div>
        </div>

        {/* metrics row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {METRICS.map((m) => (
            <div
              key={m.label}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <m.icon className={`w-4 h-4 ${m.color}`} />
                <span className="text-xs text-gray-500">{m.label}</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-white">{m.value}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{m.trend} vs last month</p>
            </div>
          ))}
        </div>

        {/* chart + categories */}
        <div className="grid md:grid-cols-[1.4fr,1fr] gap-4">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-white font-semibold">Spending trend</p>
              <p className="text-xs text-gray-500">Last 30 days</p>
            </div>
            <svg viewBox="0 0 420 100" className="w-full h-32">
              <defs>
                <linearGradient id="dashFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6C63FF" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="dashLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6C63FF" />
                  <stop offset="100%" stopColor="#00D4AA" />
                </linearGradient>
              </defs>
              <path d={`${CHART_PATH} L420,100 L0,100 Z`} fill="url(#dashFill)" />
              <path d={CHART_PATH} fill="none" stroke="url(#dashLine)" strokeWidth="2.5" strokeLinecap="round" />
              {[0, 100, 200, 300, 420].map((x, i) => (
                <circle key={i} cx={x} cy={[80, 50, 40, 25, 8][i]} r="3" fill="#6C63FF" />
              ))}
            </svg>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-sm text-white font-semibold mb-4">Top categories</p>
            <div className="space-y-3">
              {CATEGORIES.map((c) => (
                <div key={c.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">{c.name}</span>
                    <span className="text-gray-500">{c.value}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${c.value}%`, background: c.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* mini transactions */}
        <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-white font-semibold">Recent</p>
            <span className="text-xs text-gray-500">3 of 142</span>
          </div>
          <div className="space-y-2 text-sm">
            {[
              { icon: "🍱", merchant: "Swiggy", note: "Dinner", amt: "-₹240" },
              { icon: "🚌", merchant: "Auto", note: "To campus", amt: "-₹80" },
              { icon: "🛍️", merchant: "Myntra", note: "T-shirt", amt: "-₹599" },
            ].map((t, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-base">{t.icon}</span>
                  <div>
                    <p className="text-white text-xs font-medium">{t.merchant}</p>
                    <p className="text-gray-500 text-[10px]">{t.note}</p>
                  </div>
                </div>
                <span className="text-gray-300 text-xs font-medium">{t.amt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
