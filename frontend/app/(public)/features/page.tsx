import FeaturesBento from "@/components/landing/FeaturesBento";
import HowItWorks from "@/components/landing/HowItWorks";
import CTA from "@/components/landing/CTA";
import {
  Brain,
  TrendingUp,
  Bell,
  Trophy,
  BarChart3,
  Zap,
  ShieldCheck,
  Sparkles,
  FileSpreadsheet,
  IndianRupee,
  Calendar,
  PieChart,
} from "lucide-react";

const DEEP_FEATURES = [
  {
    category: "AI & Intelligence",
    color: "#A78BFA",
    items: [
      {
        icon: Brain,
        title: "Linear regression forecasting",
        desc: "Trained on your last 3 months of data, predicts your end-of-month total per category with confidence intervals.",
      },
      {
        icon: TrendingUp,
        title: "Z-score anomaly detection",
        desc: "Statistical outlier detection flags expenses that are unusual for your spending pattern, not just absolute amounts.",
      },
      {
        icon: Sparkles,
        title: "AI Coach (Gemini-powered)",
        desc: "Conversational assistant grounded in your real data. Ask 'where is my money going?' and get specific, actionable answers.",
      },
    ],
  },
  {
    category: "Tracking & Logging",
    color: "#00D4AA",
    items: [
      {
        icon: Zap,
        title: "Sub-5-second entry",
        desc: "Category → amount → payment mode → done. Optimized for one-handed phone entry while you're at the canteen.",
      },
      {
        icon: IndianRupee,
        title: "5 payment modes",
        desc: "UPI, Cash, Card, Net Banking, Wallet — all tracked separately so you can see where your digital vs cash spending sits.",
      },
      {
        icon: FileSpreadsheet,
        title: "CSV import & export",
        desc: "Bulk-import past expenses from any spreadsheet. Export everything for taxes or your own records, anytime.",
      },
    ],
  },
  {
    category: "Analytics & Insights",
    color: "#6C63FF",
    items: [
      {
        icon: PieChart,
        title: "Category donut breakdowns",
        desc: "See exactly what % of your spend goes to food, transport, shopping, bills — with merchant-level drill-downs.",
      },
      {
        icon: Calendar,
        title: "Daily heatmap",
        desc: "Calendar view shows your spending intensity per day. Spot patterns like 'Friday nights cost me ₹800 every week'.",
      },
      {
        icon: BarChart3,
        title: "Month-over-month compare",
        desc: "Side-by-side comparison of any two months. See exactly which categories grew, shrank, or held steady.",
      },
    ],
  },
  {
    category: "Habits & Motivation",
    color: "#FFB347",
    items: [
      {
        icon: Trophy,
        title: "16 achievement badges",
        desc: "Unlock badges from First Step to Wealth Architect. Each badge represents a real milestone — not vanity counters.",
      },
      {
        icon: Bell,
        title: "Smart budget alerts",
        desc: "Push notifications at 70% and 90% of your monthly limit. Catch overspending before it becomes a problem.",
      },
      {
        icon: ShieldCheck,
        title: "Streaks & XP system",
        desc: "Daily logging streaks build a habit loop. Level up from Broke Freshman to Financial Legend over months of use.",
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <>
      <section className="pt-32 pb-16 px-4 sm:px-6 text-center relative">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-[#6C63FF]/10 blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <p className="text-[#6C63FF] text-sm font-semibold uppercase tracking-widest mb-3">
            Features
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5">
            Every tool you need to{" "}
            <span className="bg-gradient-to-r from-[#6C63FF] via-[#A78BFA] to-[#00D4AA] bg-clip-text text-transparent">
              spend smarter.
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Twelve focused features. Zero fluff. Built specifically for Indian college life.
          </p>
        </div>
      </section>

      <FeaturesBento />

      {DEEP_FEATURES.map((cat) => (
        <section key={cat.category} className="py-16 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-10">
              <span
                className="w-2 h-8 rounded-full"
                style={{ background: cat.color }}
              />
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                {cat.category}
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {cat.items.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-white/[0.06] bg-[#13131A] p-6 hover:border-white/[0.14] transition-colors"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 border"
                    style={{
                      backgroundColor: `${cat.color}15`,
                      borderColor: `${cat.color}40`,
                    }}
                  >
                    <f.icon className="w-5 h-5" style={{ color: cat.color }} />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <HowItWorks />
      <CTA />
    </>
  );
}
