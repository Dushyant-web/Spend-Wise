"use client";

import { useEffect } from "react";
import { RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 flex items-center justify-center mx-auto mb-5">
          <span className="text-xl">⚡</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-gray-500 text-sm mb-6">
          This page ran into an error. Retry or go back to Dashboard.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium px-4 py-2.5 rounded-xl border border-white/10 transition-colors"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
