import PricingTable from "@/components/landing/PricingTable";
import CTA from "@/components/landing/CTA";
import { ShieldCheck, RefreshCw, Wallet, Users } from "lucide-react";

const FAQS = [
  {
    q: "Is SpendWise really free for students?",
    a: "Yes. The Free tier covers everything a typical college student needs — unlimited expense logging, alerts, badges, and basic AI. You only pay for Pro if you want predictive forecasting and unlimited AI Coach.",
  },
  {
    q: "Do I need a credit card to sign up?",
    a: "No. Sign up with email + password and you're in instantly. We never ask for a card on the Free plan.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Anytime, one click in Settings. Your Pro subscription stops at the end of the current billing period and you keep access until then. Free tier always remains available.",
  },
  {
    q: "Is my financial data secure?",
    a: "All data is encrypted at rest. We never link to your bank or scrape SMS. You stay in full control — export everything as CSV or delete your account whenever you want.",
  },
  {
    q: "Does Campus plan work for hostels and clubs?",
    a: "Yes. Up to 8 members can share a Campus group with a shared budget, settle-up suggestions, and a per-member privacy toggle so individual logs stay private if you want.",
  },
  {
    q: "What happens if I downgrade from Pro to Free?",
    a: "Nothing breaks. You keep all your historical data, badges, and streaks. Pro-only features (forecasts, anomaly detection) just become read-only until you upgrade again.",
  },
];

const GUARANTEES = [
  {
    icon: ShieldCheck,
    title: "Encrypted at rest",
    desc: "AES-256 encryption on every record. Your data is yours alone.",
    color: "#6C63FF",
  },
  {
    icon: RefreshCw,
    title: "30-day money back",
    desc: "Try Pro risk-free. Full refund within 30 days, no questions.",
    color: "#00D4AA",
  },
  {
    icon: Wallet,
    title: "Cancel anytime",
    desc: "No contracts, no annual lock-in. Stop whenever you want.",
    color: "#FFB347",
  },
  {
    icon: Users,
    title: "Built with students",
    desc: "Every feature shaped by feedback from 12,000+ Indian college students.",
    color: "#A78BFA",
  },
];

export default function PricingPage() {
  return (
    <>
      <section className="pt-32 pb-12 px-4 sm:px-6 text-center relative">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-[#00D4AA]/8 blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <p className="text-[#00D4AA] text-sm font-semibold uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5">
            Simple, honest{" "}
            <span className="bg-gradient-to-r from-[#00D4AA] to-[#6C63FF] bg-clip-text text-transparent">
              pricing.
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Free for students. Pro for power users. No hidden fees, no growth-hack dark patterns.
          </p>
        </div>
      </section>

      <PricingTable />

      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {GUARANTEES.map((g) => (
              <div
                key={g.title}
                className="rounded-2xl border border-white/[0.06] bg-[#13131A] p-6"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 border"
                  style={{
                    backgroundColor: `${g.color}15`,
                    borderColor: `${g.color}40`,
                  }}
                >
                  <g.icon className="w-5 h-5" style={{ color: g.color }} />
                </div>
                <h3 className="text-white font-semibold mb-1.5">{g.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#A78BFA] text-sm font-semibold uppercase tracking-widest mb-3">
              FAQ
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Questions, answered.
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-white/[0.06] bg-[#13131A] overflow-hidden"
              >
                <summary className="cursor-pointer list-none px-6 py-5 flex items-center justify-between gap-4">
                  <span className="text-white font-medium">{f.q}</span>
                  <span className="flex-shrink-0 w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-gray-400 group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
