"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import dynamic from "next/dynamic";
import { UserPlus, Receipt, Brain, Trophy } from "lucide-react";

const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((m) => m.Player),
  { ssr: false }
);

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STEPS = [
  {
    num: "01",
    icon: UserPlus,
    title: "Sign up in seconds",
    desc: "Email + password. No OTP, no phone number, no nonsense. You're in instantly.",
    accent: "#6C63FF",
    lottie: "https://lottie.host/4d42d1e3-3a13-4ac7-a3e4-1d3a7ad4e94f/qkLcVz1lET.json",
    fallbackEmoji: "✨",
  },
  {
    num: "02",
    icon: Receipt,
    title: "Log your first expense",
    desc: "Pick a category, type the amount, choose payment mode. Sub-5-second entry every time.",
    accent: "#00D4AA",
    lottie: "https://lottie.host/52ce05a4-5c4e-4d4d-9d9c-78ac01c8c1d0/ZFUFzMb5ZH.json",
    fallbackEmoji: "📝",
  },
  {
    num: "03",
    icon: Brain,
    title: "Let AI do the rest",
    desc: "ML predictions, smart alerts, weekly insights. The longer you use it, the smarter it gets.",
    accent: "#A78BFA",
    lottie: "https://lottie.host/c5e0866a-0aa1-4b9e-aa13-9c28a6bf9e89/HuQGYg8sLO.json",
    fallbackEmoji: "🧠",
  },
  {
    num: "04",
    icon: Trophy,
    title: "Earn badges & save more",
    desc: "Streak rewards, level-ups, and achievement badges turn budgeting into a habit you actually keep.",
    accent: "#FFB347",
    lottie: "https://lottie.host/9d2e6fcb-b3e3-43e9-b1f1-7f02a8c5f1d2/6XxfAaOHkM.json",
    fallbackEmoji: "🏆",
  },
];

export default function HowItWorks() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!track.current || !section.current) return;
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      if (isMobile) return;

      const totalWidth = track.current.scrollWidth - window.innerWidth + 100;

      gsap.to(track.current, {
        x: -totalWidth,
        ease: "none",
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: () => `+=${totalWidth}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: section }
  );

  return (
    <section
      ref={section}
      className="relative py-24 md:py-0 md:h-screen overflow-hidden bg-[#0D0D14]"
    >
      <div className="md:h-full flex flex-col justify-center">
        <div className="text-center px-4 sm:px-6 mb-10 md:mb-12">
          <p className="text-[#00D4AA] text-sm font-semibold uppercase tracking-widest mb-3">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            From zero to budgeted{" "}
            <span className="bg-gradient-to-r from-[#00D4AA] to-[#A78BFA] bg-clip-text text-transparent">
              in 4 steps
            </span>
          </h2>
        </div>

        <div className="md:overflow-hidden">
          <div
            ref={track}
            className="flex flex-col md:flex-row gap-5 md:gap-8 px-4 sm:px-6 md:pl-[10vw] md:pr-[10vw] md:will-change-transform"
          >
            {STEPS.map((s, i) => (
              <div
                key={s.num}
                className="md:w-[420px] md:flex-shrink-0 rounded-3xl border border-white/[0.06] bg-[#13131A] p-7 sm:p-8 relative overflow-hidden"
              >
                <div
                  className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-20 blur-3xl"
                  style={{ background: s.accent }}
                />

                <div className="relative">
                  <div className="flex items-center justify-between mb-5">
                    <span
                      className="text-5xl font-black bg-clip-text text-transparent"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${s.accent}, ${s.accent}40)`,
                      }}
                    >
                      {s.num}
                    </span>
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center border"
                      style={{
                        backgroundColor: `${s.accent}15`,
                        borderColor: `${s.accent}40`,
                      }}
                    >
                      <s.icon className="w-5 h-5" style={{ color: s.accent }} />
                    </div>
                  </div>

                  {/* Lottie / fallback area */}
                  <div className="h-32 mb-5 flex items-center justify-center rounded-xl bg-white/[0.02] border border-white/[0.04] overflow-hidden">
                    <Player
                      autoplay
                      loop
                      src={s.lottie}
                      style={{ height: "120px", width: "120px" }}
                      onEvent={() => {}}
                    >
                      <div className="text-5xl">{s.fallbackEmoji}</div>
                    </Player>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
