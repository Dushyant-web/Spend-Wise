"use client";

import dynamic from "next/dynamic";
import BackButton from "@/components/auth/BackButton";

const FloatingWallet = dynamic(() => import("@/components/three/FloatingWallet"), { ssr: false });

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden"
      style={{ background: "var(--bg-canvas)" }}
    >
      <BackButton href="/" />
      {/* Gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full blur-[120px]" style={{ background: "rgba(124,92,255,0.12)" }} />
        <div className="absolute top-1/3 -right-40 h-[400px] w-[400px] rounded-full blur-[100px]" style={{ background: "rgba(16,201,143,0.08)" }} />
        <div className="absolute -bottom-40 left-1/3 h-[350px] w-[350px] rounded-full blur-[100px]" style={{ background: "rgba(240,86,114,0.06)" }} />
      </div>

      {/* Grid dots */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle, var(--accent) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* 3D floating wallet — large decorative background element */}
      <div
        className="pointer-events-none absolute hidden lg:block"
        style={{ right: "4%", top: "50%", transform: "translateY(-50%)", width: 360, height: 360, opacity: 0.7 }}
      >
        <FloatingWallet />
      </div>

      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
