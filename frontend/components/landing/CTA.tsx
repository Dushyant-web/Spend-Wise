"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Sparkles } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function CTA() {
  const root = useRef<HTMLElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!orbRef.current) return;
      gsap.to(orbRef.current, {
        rotate: 360,
        duration: 60,
        repeat: -1,
        ease: "linear",
      });

      gsap.fromTo(
        ".cta-headline span",
        { opacity: 0, y: 30, filter: "blur(10px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.9,
          stagger: 0.08,
          scrollTrigger: {
            trigger: root.current,
            start: "top 75%",
          },
        }
      );
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative py-32 px-4 sm:px-6 overflow-hidden">
      <div className="relative max-w-5xl mx-auto">
        <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-gradient-to-br from-[#1a1830] via-[#13131A] to-[#13131A] p-10 sm:p-16 md:p-20 text-center">
          {/* rotating orb */}
          <div
            ref={orbRef}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div className="w-[800px] h-[800px] rounded-full bg-[conic-gradient(from_0deg,#6C63FF,#A78BFA,#00D4AA,#FFB347,#FF6B6B,#6C63FF)] opacity-[0.08] blur-3xl" />
          </div>

          {/* grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage:
                "radial-gradient(ellipse at center, black 30%, transparent 70%)",
            }}
          />

          <div className="relative">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#6C63FF]/30 bg-[#6C63FF]/10 text-[#A78BFA] text-xs font-medium mb-6">
              <Sparkles className="w-3 h-3" />
              Free forever for students
            </span>

            <h2 className="cta-headline text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] mb-6">
              <span className="block text-white">Stop guessing.</span>
              <span className="block bg-gradient-to-r from-[#6C63FF] via-[#A78BFA] to-[#00D4AA] bg-clip-text text-transparent">
                Start tracking.
              </span>
            </h2>

            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto mb-10">
              Join 12,000+ students who turned their pocket money into a budget that actually works.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="group relative inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-[#6C63FF] hover:bg-[#5B54E8] text-white font-semibold text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#6C63FF]/40"
              >
                <span className="absolute inset-0 rounded-xl bg-[#6C63FF] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity -z-10" />
                Create your account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/features"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-gray-200 font-medium transition-colors"
              >
                Explore features
              </Link>
            </div>

            <div className="mt-10 flex items-center justify-center gap-6 text-xs text-gray-500 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA]" />
                No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA]" />
                30-second signup
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA]" />
                Delete anytime
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
