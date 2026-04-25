"use client";

import { motion } from "framer-motion";
import { Sparkles, RefreshCw, Brain, AlertTriangle, TrendingUp, Target, Send, Bot, User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePredictions, predictionKeys } from "@/hooks/usePredictions";
import ForecastCard from "@/components/ai/ForecastCard";
import CategoryForecast from "@/components/ai/CategoryForecast";
import AnomalyDetection from "@/components/ai/AnomalyDetection";
import BudgetRecommendationCard from "@/components/ai/BudgetRecommendationCard";
import InsightCards from "@/components/insights/InsightCards";
import { MONTHS } from "@/lib/constants";
import api from "@/lib/api";

const BrainGlow = dynamic(() => import("@/components/three/BrainGlow"), { ssr: false });

const cardStyle = {
  background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: 16,
};

function SectionCard({
  title,
  icon,
  children,
  badge,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ ...cardStyle, padding: "20px 24px" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div style={{ padding: 6, borderRadius: 8, background: "var(--accent-subtle)", color: "var(--accent)" }}>
            {icon}
          </div>
          <h3 style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 600 }}>{title}</h3>
        </div>
        {badge}
      </div>
      {children}
    </motion.div>
  );
}

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTED = [
  "Where is most of my money going?",
  "Am I on track with my budget?",
  "How can I save more this month?",
  "What's my biggest unnecessary expense?",
];

function CoachChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI Coach. I can see your real spending data — ask me anything about your finances.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollBoxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    const userMsg: Message = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const { data } = await api.post("/ai-coach", {
        message: msg,
        history: messages.slice(-6),
      });
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I had trouble connecting. Try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ ...cardStyle, display: "flex", flexDirection: "column", height: 520 }}>
      <div
        className="flex items-center gap-2 px-5 py-3"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div style={{ padding: 6, borderRadius: 8, background: "var(--accent-subtle)", color: "var(--accent)" }}>
          <Bot style={{ width: 14, height: 14 }} />
        </div>
        <h3 style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 600 }}>Chat with AI Coach</h3>
        <span
          className="ml-auto"
          style={{
            fontSize: "0.625rem", padding: "2px 8px", borderRadius: 99,
            background: "rgba(16,201,143,0.1)", color: "var(--success)",
            border: "1px solid rgba(16,201,143,0.2)",
          }}
        >
          Powered by NVIDIA NIM
        </span>
      </div>

      <div ref={scrollBoxRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "var(--accent-subtle)" }}
              >
                <Bot style={{ width: 13, height: 13, color: "var(--accent)" }} />
              </div>
            )}
            <div
              className="max-w-[80%] rounded-2xl px-4 py-2.5 leading-relaxed"
              style={{
                fontSize: "0.875rem",
                background: m.role === "user" ? "var(--accent)" : "var(--bg-overlay)",
                color: m.role === "user" ? "#fff" : "var(--text-primary)",
                border: m.role === "user" ? "none" : "1px solid var(--border-subtle)",
                borderBottomRightRadius: m.role === "user" ? 4 : undefined,
                borderBottomLeftRadius: m.role === "assistant" ? 4 : undefined,
              }}
            >
              {m.content}
            </div>
            {m.role === "user" && (
              <div
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "var(--bg-overlay)" }}
              >
                <User style={{ width: 13, height: 13, color: "var(--text-secondary)" }} />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: "var(--accent-subtle)" }}
            >
              <Bot style={{ width: 13, height: 13, color: "var(--accent)" }} />
            </div>
            <div
              className="rounded-2xl px-4 py-3 flex gap-1"
              style={{
                background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)",
                borderBottomLeftRadius: 4,
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{ background: "var(--text-tertiary)", animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {messages.length === 1 && (
        <div className="px-4 pb-3 flex gap-2 flex-wrap">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="transition-colors"
              style={{
                fontSize: "0.75rem", padding: "5px 12px", borderRadius: 99,
                border: "1px solid var(--border-default)", color: "var(--text-tertiary)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; e.currentTarget.style.borderColor = "var(--border-default)"; }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="flex gap-2 px-4 py-3"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your spending…"
          className="input flex-1"
          style={{ borderRadius: 12 }}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
          style={{
            background: "var(--accent)", opacity: (!input.trim() || loading) ? 0.4 : 1,
          }}
        >
          <Send style={{ width: 15, height: 15, color: "#fff" }} />
        </button>
      </form>
    </div>
  );
}

export default function AICoachPage() {
  const { data, isLoading, isError, dataUpdatedAt } = usePredictions();
  const qc = useQueryClient();
  const today = new Date();
  const nextMonthName = MONTHS[today.getMonth() === 11 ? 0 : today.getMonth() + 1];

  const refresh = () => qc.invalidateQueries({ queryKey: predictionKeys.all });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 lg:px-8 space-y-4">
        <div style={{ height: 140, borderRadius: 16 }} className="skeleton" />
        <div style={{ height: 520, borderRadius: 16 }} className="skeleton" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div style={{ height: 200, borderRadius: 16 }} className="skeleton" />
          <div style={{ height: 200, borderRadius: 16 }} className="skeleton" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
        <div style={{ width: 120, height: 120, pointerEvents: "none" }}>
          <BrainGlow />
        </div>
        <p style={{ color: "var(--text-primary)", fontWeight: 600 }}>Not enough data yet</p>
        <p style={{ color: "var(--text-tertiary)", fontSize: "0.875rem" }}>
          Add at least a few expenses to unlock AI predictions.
        </p>
      </div>
    );
  }

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 pb-24 lg:pb-8 space-y-5">

      {/* Hero with 3D BrainGlow */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden flex items-center justify-between rounded-2xl"
        style={{ ...cardStyle, padding: "20px 24px", minHeight: 110 }}
      >
        <div style={{
          position: "absolute", inset: 0, opacity: 0.07,
          background: "radial-gradient(ellipse at 80% 50%, var(--accent), transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative" }}>
          <div className="flex items-center gap-2">
            <Sparkles style={{ width: 16, height: 16, color: "var(--accent)" }} />
            <p style={{ color: "var(--text-primary)", fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.02em" }}
               className="font-display">
              AI Coach
            </p>
          </div>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.813rem", marginTop: 4 }}>
            Predictions for {nextMonthName} · {data.data_months_used} month{data.data_months_used !== 1 ? "s" : ""} of data
            {lastUpdated && ` · Updated ${lastUpdated}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div style={{ width: 100, height: 100, pointerEvents: "none" }} className="hidden sm:block">
            <BrainGlow />
          </div>
          <button
            onClick={refresh}
            className="btn btn-secondary"
            style={{ height: 32, paddingLeft: 12, paddingRight: 12, fontSize: "0.813rem" }}
          >
            <RefreshCw style={{ width: 13, height: 13 }} /> Refresh
          </button>
        </div>
      </motion.div>

      {/* Accuracy badge */}
      {data.historical_accuracy !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2"
          style={{
            background: "rgba(16,201,143,0.06)", border: "1px solid rgba(16,201,143,0.2)",
            borderRadius: 10, padding: "10px 16px",
          }}
        >
          <Target style={{ width: 14, height: 14, color: "var(--success)", flexShrink: 0 }} />
          <p style={{ fontSize: "0.875rem", color: "var(--success)" }}>
            <strong>{data.historical_accuracy}%</strong> prediction accuracy on last month — model is learning your patterns.
          </p>
        </motion.div>
      )}

      {/* AI Chat */}
      <CoachChat />

      {/* Insights */}
      <InsightCards limit={3} />

      {/* Main forecast */}
      <SectionCard
        title={`Spend Forecast — ${nextMonthName}`}
        icon={<TrendingUp style={{ width: 14, height: 14 }} />}
        badge={
          <span style={{
            fontSize: "0.75rem", padding: "2px 8px", borderRadius: 99,
            background: "var(--accent-subtle)", color: "var(--accent)",
            border: "1px solid rgba(124,92,255,0.2)", fontWeight: 500,
          }}>
            Linear Regression
          </span>
        }
      >
        <ForecastCard forecast={data.next_month_forecast} dataMonths={data.data_months_used} />
      </SectionCard>

      {/* 2-col row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard
          title="Category Forecasts"
          icon={<Brain style={{ width: 14, height: 14 }} />}
          badge={
            <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>for {nextMonthName}</span>
          }
        >
          <CategoryForecast predictions={data.category_predictions} />
        </SectionCard>

        <SectionCard
          title="Smart Budget Recommendation"
          icon={<Target style={{ width: 14, height: 14 }} />}
        >
          <BudgetRecommendationCard rec={data.budget_recommendation} />
        </SectionCard>
      </div>

      {/* Anomaly detection */}
      <SectionCard
        title="Anomaly Detection"
        icon={<AlertTriangle style={{ width: 14, height: 14 }} />}
        badge={
          data.anomalies.length > 0 ? (
            <span style={{
              fontSize: "0.75rem", padding: "2px 8px", borderRadius: 99, fontWeight: 500,
              background: "rgba(240,86,114,0.1)", color: "var(--danger)",
              border: "1px solid rgba(240,86,114,0.2)",
            }}>
              {data.anomalies.length} flagged
            </span>
          ) : (
            <span style={{
              fontSize: "0.75rem", padding: "2px 8px", borderRadius: 99, fontWeight: 500,
              background: "rgba(16,201,143,0.1)", color: "var(--success)",
              border: "1px solid rgba(16,201,143,0.2)",
            }}>
              All clear
            </span>
          )
        }
      >
        <AnomalyDetection anomalies={data.anomalies} />
      </SectionCard>
    </div>
  );
}
