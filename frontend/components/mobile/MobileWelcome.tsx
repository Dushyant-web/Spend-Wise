"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Sparkles } from "lucide-react";
import StarsBackground from "./StarsBackground";

const FloatingWallet = dynamic(() => import("@/components/three/FloatingWallet"), {
  ssr: false,
  loading: () => null,
});

export default function MobileWelcome() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background:
          "radial-gradient(120% 80% at 50% 0%, #1a1638 0%, #0a0a18 55%, #050510 100%)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <StarsBackground />

      {/* Aurora glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-20%",
          left: "-10%",
          width: "120%",
          height: "70%",
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(108,99,255,0.35) 0%, rgba(108,99,255,0) 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-15%",
          right: "-15%",
          width: "100%",
          height: "60%",
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(0,212,170,0.22) 0%, rgba(0,212,170,0) 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Brand chip */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "relative",
          zIndex: 3,
          paddingTop: "max(env(safe-area-inset-top), 28px)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 22,
              height: 22,
              borderRadius: 7,
              background: "linear-gradient(135deg, #6C63FF, #8B5CF6)",
              boxShadow: "0 0 18px rgba(108,99,255,0.55)",
            }}
          >
            <Zap style={{ width: 12, height: 12, color: "#fff" }} fill="#fff" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#F0F0FF", letterSpacing: 0.2 }}>
            SpendWise AI
          </span>
        </div>
      </motion.div>

      {/* 3D Hero */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          style={{ width: "100%", height: "100%", maxWidth: 520 }}
        >
          <FloatingWallet />
        </motion.div>
      </div>

      {/* Bottom card */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
        style={{
          position: "relative",
          zIndex: 3,
          padding: "24px 22px max(env(safe-area-inset-bottom), 28px) 22px",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 10px",
            marginBottom: 14,
            borderRadius: 999,
            background: "rgba(167,139,250,0.12)",
            border: "1px solid rgba(167,139,250,0.25)",
          }}
        >
          <Sparkles style={{ width: 11, height: 11, color: "#A78BFA" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#C4B5FD", letterSpacing: 0.3 }}>
            BUILT FOR INDIAN STUDENTS
          </span>
        </div>

        <h1
          style={{
            fontSize: 34,
            lineHeight: 1.05,
            fontWeight: 700,
            color: "#F8F8FF",
            margin: 0,
            letterSpacing: -0.8,
          }}
        >
          Spend smarter.
          <br />
          <span
            style={{
              background: "linear-gradient(90deg, #A78BFA 0%, #6C63FF 50%, #00D4AA 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Save bigger.
          </span>
        </h1>

        <p
          style={{
            marginTop: 10,
            marginBottom: 20,
            fontSize: 14.5,
            lineHeight: 1.45,
            color: "#9CA3AF",
            maxWidth: 340,
          }}
        >
          AI-powered budgeting, instant insights, and habits that actually stick.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href="/register" style={{ textDecoration: "none" }}>
            <motion.div
              whileTap={{ scale: 0.97 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                height: 54,
                borderRadius: 16,
                background: "linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)",
                color: "#fff",
                fontWeight: 600,
                fontSize: 16,
                boxShadow: "0 12px 30px rgba(108,99,255,0.45), 0 0 0 1px rgba(255,255,255,0.06) inset",
              }}
            >
              Get started — it's free
              <ArrowRight style={{ width: 17, height: 17 }} />
            </motion.div>
          </Link>

          <Link href="/login" style={{ textDecoration: "none" }}>
            <motion.div
              whileTap={{ scale: 0.97 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 50,
                borderRadius: 16,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#E5E7EB",
                fontWeight: 500,
                fontSize: 15,
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              I already have an account
            </motion.div>
          </Link>
        </div>

        <p
          style={{
            marginTop: 16,
            textAlign: "center",
            fontSize: 11.5,
            lineHeight: 1.5,
            color: "#6B7280",
          }}
        >
          By continuing, you agree to our{" "}
          <Link href="/terms" style={{ color: "#A78BFA", textDecoration: "none" }}>
            Terms
          </Link>{" "}
          &{" "}
          <Link href="/privacy" style={{ color: "#A78BFA", textDecoration: "none" }}>
            Privacy Policy
          </Link>
          .
        </p>
      </motion.div>
    </div>
  );
}
