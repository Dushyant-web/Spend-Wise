"use client";

import { useState } from "react";
import { Mail, MessageSquare, MapPin, Send, Twitter, Github, Linkedin, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const REASONS = [
  { value: "support", label: "Get help / report a bug" },
  { value: "partnership", label: "Partnership / campus ambassador" },
  { value: "press", label: "Press inquiry" },
  { value: "feedback", label: "Product feedback" },
  { value: "other", label: "Something else" },
];

const CONTACT_CARDS = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@spendwise.ai",
    href: "mailto:hello@spendwise.ai",
    color: "#6C63FF",
  },
  {
    icon: MessageSquare,
    label: "Live chat",
    value: "Tap the bubble bottom-right",
    href: null,
    color: "#00D4AA",
  },
  {
    icon: MapPin,
    label: "Headquarters",
    value: "Bangalore, IN · Remote-first",
    href: null,
    color: "#FFB347",
  },
];

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState("support");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Message sent! We'll reply within a day.");
    (e.target as HTMLFormElement).reset();
    setReason("support");
    setSubmitting(false);
  }

  return (
    <>
      <section className="pt-32 pb-12 px-4 sm:px-6 text-center relative">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-[#6C63FF]/10 blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#6C63FF]/30 bg-[#6C63FF]/10 text-[#A78BFA] text-xs font-medium mb-6">
            <Sparkles className="w-3 h-3" />
            We reply within 24 hours
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5">
            Let's{" "}
            <span className="bg-gradient-to-r from-[#6C63FF] via-[#A78BFA] to-[#00D4AA] bg-clip-text text-transparent">
              talk.
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Bug, idea, partnership pitch, or just hi — we read every message ourselves.
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.2fr,1fr] gap-6">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-white/[0.08] bg-[#13131A] p-7 sm:p-10"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Send us a message</h2>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2 font-medium">
                  Your name
                </label>
                <input
                  required
                  name="name"
                  type="text"
                  placeholder="Aarav Krishnan"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-gray-600 focus:outline-none focus:border-[#6C63FF]/60 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 font-medium">
                  Email
                </label>
                <input
                  required
                  name="email"
                  type="email"
                  placeholder="aarav@college.edu.in"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-gray-600 focus:outline-none focus:border-[#6C63FF]/60 transition-colors"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-2 font-medium">
                What's this about?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {REASONS.map((r) => (
                  <button
                    type="button"
                    key={r.value}
                    onClick={() => setReason(r.value)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors text-left ${
                      reason === r.value
                        ? "border-[#6C63FF]/60 bg-[#6C63FF]/15 text-white"
                        : "border-white/[0.08] bg-white/[0.02] text-gray-400 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs text-gray-400 mb-2 font-medium">
                Message
              </label>
              <textarea
                required
                name="message"
                rows={6}
                placeholder="Tell us what's on your mind…"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-gray-600 focus:outline-none focus:border-[#6C63FF]/60 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#6C63FF] hover:bg-[#5B54E8] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#6C63FF]/30"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send message
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 mt-4">
              By sending, you agree to our terms. We never share your email.
            </p>
          </form>

          {/* Contact info */}
          <div className="space-y-4">
            {CONTACT_CARDS.map((c) => {
              const inner = (
                <>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 border"
                    style={{
                      backgroundColor: `${c.color}15`,
                      borderColor: `${c.color}40`,
                    }}
                  >
                    <c.icon className="w-5 h-5" style={{ color: c.color }} />
                  </div>
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">
                    {c.label}
                  </p>
                  <p className="text-white font-medium">{c.value}</p>
                </>
              );

              return c.href ? (
                <a
                  key={c.label}
                  href={c.href}
                  className="block rounded-2xl border border-white/[0.08] bg-[#13131A] p-6 hover:border-white/[0.16] transition-colors"
                >
                  {inner}
                </a>
              ) : (
                <div
                  key={c.label}
                  className="rounded-2xl border border-white/[0.08] bg-[#13131A] p-6"
                >
                  {inner}
                </div>
              );
            })}

            <div className="rounded-2xl border border-white/[0.08] bg-[#13131A] p-6">
              <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-semibold">
                Follow along
              </p>
              <div className="flex gap-2">
                {[
                  { icon: Twitter, href: "https://twitter.com" },
                  { icon: Github, href: "https://github.com" },
                  { icon: Linkedin, href: "https://linkedin.com" },
                ].map((s, i) => (
                  <a
                    key={i}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-xl border border-white/[0.08] bg-white/[0.02] text-gray-400 hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-colors"
                  >
                    <s.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
