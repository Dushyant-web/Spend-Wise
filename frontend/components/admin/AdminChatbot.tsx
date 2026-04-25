"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Loader2, Bot, Shield } from "lucide-react";
import { useAdminChat } from "@/hooks/useAdmin";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Show platform overview",
  "Who are the top 5 users by XP?",
  "Who spent the most this month?",
  "How many users joined this month?",
];

function ChatMessage({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {!isUser && (
        <div
          className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
          style={{ background: "var(--accent-subtle)", border: "1px solid var(--border-gold)" }}
        >
          <Shield style={{ width: 11, height: 11, color: "var(--accent)" }} />
        </div>
      )}
      <div
        className="max-w-[82%] rounded-2xl px-3.5 py-2.5"
        style={isUser ? {
          background: "var(--accent)",
          color: "#060504",
          borderBottomRightRadius: 6,
        } : {
          background: "var(--bg-overlay)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-subtle)",
          borderBottomLeftRadius: 6,
        }}
      >
        <p style={{ fontSize: "0.813rem", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
          {msg.content}
        </p>
      </div>
    </div>
  );
}

export default function AdminChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chat = useAdminChat();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chat.isPending]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || chat.isPending) return;
    setInput("");
    const updated: Message[] = [...messages, { role: "user", content: msg }];
    setMessages(updated);
    try {
      const { reply } = await chat.mutateAsync({ message: msg, history: messages });
      setMessages([...updated, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...updated, { role: "assistant", content: "Something went wrong. Please try again." }]);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full shadow-xl"
        style={{
          background: "linear-gradient(135deg, #C9A96E 0%, #D9BA7E 100%)",
          color: "#060504",
          padding: "12px 20px",
          fontWeight: 600,
          fontSize: "0.813rem",
          letterSpacing: "0.02em",
          boxShadow: "0 8px 32px rgba(201,169,110,0.35)",
        }}
      >
        <Shield style={{ width: 15, height: 15 }} />
        Admin AI
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(6,5,4,0.55)", backdropFilter: "blur(4px)" }}
            />

            {/* Chat window */}
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              className="fixed bottom-6 right-6 z-50 flex flex-col"
              style={{
                width: 420,
                height: 580,
                maxHeight: "calc(100vh - 48px)",
                background: "var(--bg-base)",
                border: "1px solid var(--border-gold)",
                borderRadius: 18,
                overflow: "hidden",
                boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,169,110,0.10)",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
                style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--accent-subtle)", border: "1px solid var(--border-gold)" }}
                >
                  <Shield style={{ width: 14, height: 14, color: "var(--accent)" }} />
                </div>
                <div className="flex-1">
                  <p className="font-display" style={{ color: "var(--text-primary)", fontSize: "0.938rem", fontWeight: 600 }}>
                    Admin Intelligence
                  </p>
                  <p style={{ color: "var(--text-tertiary)", fontSize: "0.685rem" }}>
                    Full platform access · No password data
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  style={{ color: "var(--text-tertiary)", padding: 4, borderRadius: 6 }}
                >
                  <X style={{ width: 15, height: 15 }} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar">
                {messages.length === 0 && (
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <div
                        className="text-center px-4 py-3 rounded-xl"
                        style={{ background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)", maxWidth: 280 }}
                      >
                        <Shield style={{ width: 18, height: 18, color: "var(--accent)", margin: "0 auto 8px" }} />
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.785rem", lineHeight: 1.5 }}>
                          Ask me anything about your platform, any user, their expenses, achievements, or stats.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => send(s)}
                          className="w-full text-left px-3 py-2 rounded-lg transition-colors"
                          style={{
                            background: "var(--bg-overlay)",
                            color: "var(--text-secondary)",
                            fontSize: "0.785rem",
                            border: "1px solid var(--border-subtle)",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-gold)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((m, i) => <ChatMessage key={i} msg={m} />)}
                {chat.isPending && (
                  <div className="flex gap-2.5">
                    <div
                      className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                      style={{ background: "var(--accent-subtle)", border: "1px solid var(--border-gold)" }}
                    >
                      <Shield style={{ width: 11, height: 11, color: "var(--accent)" }} />
                    </div>
                    <div
                      className="rounded-2xl px-4 py-3"
                      style={{ background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)", borderBottomLeftRadius: 6 }}
                    >
                      <Loader2 style={{ width: 14, height: 14, color: "var(--accent)" }} className="animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div
                className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
                style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask about any user or platform…"
                  className="flex-1 bg-transparent outline-none"
                  style={{ color: "var(--text-primary)", fontSize: "0.813rem" }}
                  disabled={chat.isPending}
                />
                <motion.button
                  whileTap={{ scale: 0.90 }}
                  onClick={() => send()}
                  disabled={!input.trim() || chat.isPending}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: input.trim() ? "var(--accent)" : "var(--bg-overlay)",
                    color: input.trim() ? "#060504" : "var(--text-tertiary)",
                    transition: "background 150ms ease",
                  }}
                >
                  <Send style={{ width: 13, height: 13 }} />
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
