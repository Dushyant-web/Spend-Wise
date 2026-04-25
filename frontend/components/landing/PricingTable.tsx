"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, Zap } from "lucide-react";

type Plan = {
  name: string;
  tag?: string;
  monthly: number;
  yearly: number;
  highlight?: boolean;
  blurb: string;
  features: { text: string; included: boolean }[];
  cta: string;
  href: string;
  accent: string;
};

const PLANS: Plan[] = [
  {
    name: "Free",
    monthly: 0,
    yearly: 0,
    blurb: "Everything a student actually needs. No card required.",
    features: [
      { text: "Unlimited expense logging", included: true },
      { text: "16 achievement badges + streaks", included: true },
      { text: "Smart budget alerts (70% / 90%)", included: true },
      { text: "Monthly trends & category insights", included: true },
      { text: "AI Coach (50 messages / month)", included: true },
      { text: "Predictive forecasting", included: false },
      { text: "Anomaly detection", included: false },
    ],
    cta: "Start Free",
    href: "/register",
    accent: "#6C63FF",
  },
  {
    name: "Pro",
    tag: "Most Popular",
    monthly: 99,
    yearly: 79,
    highlight: true,
    blurb: "Full AI suite for serious savers.",
    features: [
      { text: "Everything in Free", included: true },
      { text: "Unlimited AI Coach", included: true },
      { text: "Predictive monthly forecasts", included: true },
      { text: "Z-score anomaly detection", included: true },
      { text: "Merchant-level analytics", included: true },
      { text: "Export to CSV / Excel", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Get Pro",
    href: "/register?plan=pro",
    accent: "#A78BFA",
  },
  {
    name: "Campus",
    monthly: 49,
    yearly: 39,
    blurb: "For student clubs, hostels & shared budgets.",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Up to 8 group members", included: true },
      { text: "Shared expense tracking", included: true },
      { text: "Settle-up suggestions", included: true },
      { text: "Group challenges & leaderboard", included: true },
      { text: "Admin dashboard", included: true },
      { text: "Per-member privacy controls", included: true },
    ],
    cta: "Start Group",
    href: "/register?plan=campus",
    accent: "#00D4AA",
  },
];

export default function PricingTable() {
  const [yearly, setYearly] = useState(true);

  return (
    <section id="pricing" className="relative py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-[#00D4AA] text-sm font-semibold uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Free for students.{" "}
            <span className="bg-gradient-to-r from-[#00D4AA] to-[#6C63FF] bg-clip-text text-transparent">
              Always.
            </span>
          </h2>
          <p className="text-gray-400 mt-3 max-w-xl mx-auto">
            Pro tier exists for power users. The free tier covers 95% of student needs.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-1 p-1 rounded-full border border-white/10 bg-[#13131A]">
            <button
              onClick={() => setYearly(false)}
              className={`relative px-5 py-2 text-sm font-medium rounded-full transition-colors ${
                !yearly ? "text-white" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {!yearly && (
                <motion.span
                  layoutId="pricing-toggle"
                  className="absolute inset-0 rounded-full bg-[#6C63FF]"
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              )}
              <span className="relative">Monthly</span>
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`relative px-5 py-2 text-sm font-medium rounded-full transition-colors flex items-center gap-2 ${
                yearly ? "text-white" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {yearly && (
                <motion.span
                  layoutId="pricing-toggle"
                  className="absolute inset-0 rounded-full bg-[#6C63FF]"
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              )}
              <span className="relative">Yearly</span>
              <span className="relative text-[10px] px-1.5 py-0.5 rounded-full bg-[#00D4AA] text-black font-bold">
                -20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map((p) => {
            const price = yearly ? p.yearly : p.monthly;
            return (
              <div
                key={p.name}
                className={`relative rounded-3xl border p-7 sm:p-8 flex flex-col ${
                  p.highlight
                    ? "border-[#6C63FF]/40 bg-gradient-to-b from-[#6C63FF]/10 to-[#13131A]"
                    : "border-white/[0.08] bg-[#13131A]"
                }`}
              >
                {p.tag && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-[#6C63FF] to-[#A78BFA] text-white flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {p.tag}
                  </span>
                )}

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-white">{p.name}</h3>
                    {p.highlight && (
                      <Zap className="w-4 h-4" style={{ color: p.accent }} />
                    )}
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{p.blurb}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">
                      ₹{price}
                    </span>
                    <span className="text-gray-500 text-sm">/mo</span>
                  </div>
                  {yearly && p.monthly > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="line-through">₹{p.monthly}</span>{" "}
                      <span className="text-[#00D4AA]">save 20%</span>
                    </p>
                  )}
                  {p.monthly === 0 && (
                    <p className="text-xs text-gray-500 mt-1">Forever free for students</p>
                  )}
                </div>

                <Link
                  href={p.href}
                  className={`block text-center px-5 py-3 rounded-xl font-semibold mb-6 transition-all hover:scale-[1.01] active:scale-[0.99] ${
                    p.highlight
                      ? "bg-[#6C63FF] hover:bg-[#5B54E8] text-white shadow-lg shadow-[#6C63FF]/30"
                      : "bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10"
                  }`}
                >
                  {p.cta}
                </Link>

                <ul className="space-y-3 flex-1">
                  {p.features.map((f, i) => (
                    <li
                      key={i}
                      className={`flex items-start gap-3 text-sm ${
                        f.included ? "text-gray-200" : "text-gray-600 line-through"
                      }`}
                    >
                      <span
                        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                        style={{
                          backgroundColor: f.included ? `${p.accent}20` : "transparent",
                          border: f.included ? "none" : "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        {f.included && (
                          <Check
                            className="w-3 h-3"
                            style={{ color: p.accent }}
                            strokeWidth={3}
                          />
                        )}
                      </span>
                      <span>{f.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <p className="text-center text-gray-500 text-sm mt-10">
          All plans include encryption at rest, full data export, and one-tap account deletion.
        </p>
      </div>
    </section>
  );
}
