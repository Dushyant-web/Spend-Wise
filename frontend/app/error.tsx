"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#0A0A0F] flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">⚡</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-gray-500 text-sm mb-8">
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            className="flex items-center gap-2 bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
