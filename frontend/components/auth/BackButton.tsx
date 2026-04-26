"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} aria-label="Go back" style={{ textDecoration: "none" }}>
      <motion.div
        whileTap={{ scale: 0.92 }}
        whileHover={{ x: -2 }}
        style={{
          position: "fixed",
          top: "max(env(safe-area-inset-top), 18px)",
          left: 18,
          zIndex: 50,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          height: 40,
          paddingLeft: 12,
          paddingRight: 16,
          borderRadius: 999,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#E5E7EB",
          fontSize: 13,
          fontWeight: 500,
          backdropFilter: "blur(14px) saturate(140%)",
          WebkitBackdropFilter: "blur(14px) saturate(140%)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.04) inset",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 22,
            height: 22,
            borderRadius: 999,
            background: "linear-gradient(135deg, rgba(108,99,255,0.45), rgba(167,139,250,0.35))",
            boxShadow: "0 0 14px rgba(108,99,255,0.45)",
          }}
        >
          <ArrowLeft style={{ width: 13, height: 13, color: "#fff" }} />
        </span>
        Back
      </motion.div>
    </Link>
  );
}
