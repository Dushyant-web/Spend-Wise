"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Aditi Sharma",
    role: "B.Tech CSE, IIT Delhi",
    avatar: "AS",
    color: "#6C63FF",
    quote:
      "I went from spending ₹12k a month on Swiggy without realizing to actually saving ₹3k by month end. The AI predictions are scary accurate.",
    rating: 5,
  },
  {
    name: "Rohan Mehta",
    role: "BBA, NMIMS Mumbai",
    avatar: "RM",
    color: "#00D4AA",
    quote:
      "The streaks gamification got me hooked. I'm on a 47-day logging streak and finally know where my pocket money is going.",
    rating: 5,
  },
  {
    name: "Sneha Patel",
    role: "M.Sc, BITS Pilani",
    avatar: "SP",
    color: "#FFB347",
    quote:
      "Sub-5-second expense entry is unreal. I log every chai while standing at the tapri. No friction at all.",
    rating: 5,
  },
  {
    name: "Karan Singh",
    role: "B.Com, DU North Campus",
    avatar: "KS",
    color: "#FF6B6B",
    quote:
      "The weekly insights helped me realize I was overpaying for Ola when the metro was right there. Saved ₹1,800 in transport last month.",
    rating: 5,
  },
  {
    name: "Priya Iyer",
    role: "B.Tech IT, VIT Vellore",
    avatar: "PI",
    color: "#A78BFA",
    quote:
      "Finally a finance app that doesn't feel built for 35-year-old bankers. The dark UI is gorgeous and the badges actually motivate me.",
    rating: 5,
  },
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = () => {
    setDirection(1);
    setIndex((i) => (i + 1) % TESTIMONIALS.length);
  };
  const prev = () => {
    setDirection(-1);
    setIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % TESTIMONIALS.length);
    }, 5500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const t = TESTIMONIALS[index];

  return (
    <section className="relative py-24 px-4 sm:px-6 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-[#A78BFA]/8 blur-[120px]" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[#A78BFA] text-sm font-semibold uppercase tracking-widest mb-3">
            Loved by students
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Real stories from{" "}
            <span className="bg-gradient-to-r from-[#A78BFA] to-[#00D4AA] bg-clip-text text-transparent">
              real campuses
            </span>
          </h2>
        </div>

        <div className="relative">
          <div className="relative h-[320px] sm:h-[280px] md:h-[260px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={index}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 60 : -60, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: direction > 0 ? -60 : 60, scale: 0.96 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <div className="relative h-full rounded-3xl border border-white/[0.08] bg-[#13131A] p-8 sm:p-10 md:p-12 overflow-hidden">
                  <div
                    className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-20 blur-3xl"
                    style={{ background: t.color }}
                  />
                  <Quote
                    className="absolute top-6 right-6 w-12 h-12 opacity-10"
                    style={{ color: t.color }}
                  />

                  <div className="relative">
                    <div className="flex items-center gap-1 mb-5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-[#FFB347] text-[#FFB347]"
                        />
                      ))}
                    </div>

                    <p className="text-lg sm:text-xl md:text-2xl text-white leading-relaxed mb-8 font-medium">
                      &ldquo;{t.quote}&rdquo;
                    </p>

                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{
                          background: `linear-gradient(135deg, ${t.color}, ${t.color}80)`,
                        }}
                      >
                        {t.avatar}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{t.name}</p>
                        <p className="text-gray-500 text-sm">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-8 bg-white" : "w-1.5 bg-white/30"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white flex items-center justify-center transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={next}
                className="w-10 h-10 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white flex items-center justify-center transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
