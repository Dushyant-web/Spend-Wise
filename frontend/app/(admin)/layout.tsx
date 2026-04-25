"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, BarChart3, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/api";
import type { User } from "@/types/user";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, clearAuth, updateUser } = useAuthStore();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const waitForHydration = () =>
      new Promise<void>((resolve) => {
        if (useAuthStore.persist.hasHydrated()) return resolve();
        const unsub = useAuthStore.persist.onFinishHydration(() => {
          unsub();
          resolve();
        });
      });

    (async () => {
      await waitForHydration();
      if (cancelled) return;
      const { isAuthenticated: authed, accessToken } = useAuthStore.getState();
      if (!authed || !accessToken) {
        router.replace("/login");
        return;
      }
      try {
        const { data } = await api.get<User>("/users/me");
        if (cancelled) return;
        updateUser(data);
        if (!data.is_admin) {
          router.replace("/dashboard");
          return;
        }
        setChecking(false);
      } catch {
        if (!cancelled) router.replace("/login");
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-canvas)" }}>
        <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "var(--border-strong)", borderTopColor: "var(--accent)" }} />
      </div>
    );
  }
  if (!user.is_admin) return null;

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-canvas)", color: "var(--text-primary)" }}>
      {/* Sidebar */}
      <aside
        className="w-56 flex flex-col"
        style={{ background: "var(--bg-base)", borderRight: "1px solid var(--border-subtle)" }}
      >
        <div
          className="flex items-center gap-2 px-4 h-14"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(240,86,114,0.15)" }}
          >
            <Zap style={{ width: 14, height: 14, color: "var(--danger)" }} fill="currentColor" />
          </div>
          <div>
            <p style={{ color: "var(--text-primary)", fontSize: "0.813rem", fontWeight: 600 }}>SpendWise</p>
            <p style={{ color: "var(--danger)", fontSize: "0.625rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Admin</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors"
            style={{ fontSize: "0.813rem", color: "var(--text-secondary)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-overlay)"; e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = ""; e.currentTarget.style.color = "var(--text-secondary)"; }}
          >
            <BarChart3 style={{ width: 14, height: 14 }} />
            Dashboard
          </Link>
        </nav>

        <div className="p-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <div className="flex items-center gap-2 mb-3 px-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: "var(--accent)", fontSize: "0.625rem" }}
            >
              {user.name[0]}
            </div>
            <p style={{ color: "var(--text-primary)", fontSize: "0.75rem", fontWeight: 500 }} className="truncate">
              {user.name}
            </p>
          </div>
          <button
            onClick={() => { clearAuth(); router.push("/login"); }}
            className="flex items-center gap-2 px-3 py-2 w-full rounded-lg transition-colors"
            style={{ fontSize: "0.813rem", color: "var(--text-tertiary)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-overlay)"; e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = ""; e.currentTarget.style.color = "var(--text-tertiary)"; }}
          >
            <LogOut style={{ width: 14, height: 14 }} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
