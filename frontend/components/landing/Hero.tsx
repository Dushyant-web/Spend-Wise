"use client";

import Link from "next/link";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Play, Sparkles } from "lucide-react";

const FloatingWallet = dynamic(() => import("@/components/three/FloatingWallet"), {
  ssr: false,
  loading: () => null,
});

const PAYMENT_MODES = ["UPI", "Cash", "Card", "Net Banking", "Wallet"];

const STATS = [
  { value: "12,000+", label: "Students joined" },
  { value: "₹4.2Cr", label: "Tracked" },
  { value: "92%", label: "Save more" },
  { value: "16", label: "Achievement badges" },
];

export default function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.fromTo(
        ".hero-badge",
        { opacity: 0, y: 20, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7 }
      )
        .fromTo(
          ".hero-line",
          { opacity: 0, y: 60, filter: "blur(20px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 1, stagger: 0.1 },
          "-=0.4"
        )
        .fromTo(
          ".hero-sub",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.5"
        )
        .fromTo(
          ".hero-cta",
          { opacity: 0, y: 20, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.08 },
          "-=0.4"
        )
        .fromTo(
          ".hero-pill",
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.04 },
          "-=0.3"
        )
        .fromTo(
          ".hero-stat",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 },
          "-=0.2"
        );
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative pt-28 pb-20 px-4 sm:px-6 overflow-hidden">
      {/* animated gradient mesh background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-[#6C63FF]/15 blur-[140px] animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full bg-[#00D4AA]/10 blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[#FF6B6B]/8 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(108,99,255,0.15),transparent_50%)]" />
      </div>

      {/* grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1fr,1.05fr] items-center gap-10">
        {/* Left: copy */}
        <div className="text-center lg:text-left">
          <span className="hero-badge inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#6C63FF]/30 bg-[#6C63FF]/10 text-[#A78BFA] text-xs font-medium mb-6">
            <Sparkles className="w-3 h-3" />
            Built for Indian college students
          </span>

          <h1 className="text-[40px] leading-[1.05] sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="hero-line block">Your money,</span>
            <span className="hero-line block bg-gradient-to-r from-[#6C63FF] via-[#A78BFA] to-[#00D4AA] bg-clip-text text-transparent">
              finally intelligent.
            </span>
          </h1>

          <p className="hero-sub text-gray-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
            Track expenses, predict overspending, and build better habits — all with the help of AI.
            Free forever for students.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Link
              href="/register"
              className="hero-cta group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#6C63FF] hover:bg-[#5B54E8] text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#6C63FF]/30"
            >
              <span className="absolute inset-0 rounded-xl bg-[#6C63FF] blur-xl opacity-50 group-hover:opacity-70 transition-opacity -z-10" />
              Start Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#preview"
              className="hero-cta inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-gray-200 font-medium transition-colors backdrop-blur-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              Watch demo
            </a>
          </div>

          <div className="mt-8 flex items-center justify-center lg:justify-start gap-2 flex-wrap">
            <span className="text-gray-500 text-sm">Supports</span>
            {PAYMENT_MODES.map((m) => (
              <span
                key={m}
                className="hero-pill text-xs px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-gray-300"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Right: 3D wallet */}
        <div className="relative h-[400px] sm:h-[480px] lg:h-[560px]">
          <div className="absolute inset-0">
            <FloatingWallet />
          </div>
          {/* radial glow under wallet */}
          <div className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 w-72 h-32 rounded-[100%] bg-[#6C63FF]/30 blur-3xl" />
        </div>
      </div>

      {/* Stats strip */}
      <div className="relative mt-16 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="hero-stat rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-4 text-center"
          >
            <p className="text-xl sm:text-2xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
              {s.value}
            </p>
            <p className="text-gray-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
