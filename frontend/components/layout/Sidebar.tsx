"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Receipt, PiggyBank, BarChart3,
  Sparkles, Trophy, Settings, LogOut, Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";
import { useAuth } from "@/hooks/useAuth";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
      { href: "/expenses",     label: "Expenses",     icon: Receipt },
      { href: "/budget",       label: "Budget",       icon: PiggyBank },
      { href: "/reports",      label: "Reports",      icon: BarChart3 },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/ai-coach",     label: "AI Coach",     icon: Sparkles },
      { href: "/achievements", label: "Achievements", icon: Trophy },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/settings",     label: "Settings",     icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { logout } = useAuth();

  const xp = (user as any)?.stats?.total_xp ?? 0;
  const level = (user as any)?.stats?.current_level ?? 1;
  const xpInLevel = xp % 100;
  const initials = user?.name?.slice(0, 2).toUpperCase() ?? "U";

  const activeHref = NAV_SECTIONS
    .flatMap((s) => s.items)
    .find(({ href }) => pathname === href || pathname.startsWith(`${href}/`))?.href;

  return (
    <aside
      className="hidden lg:flex flex-col w-60 min-h-screen fixed left-0 top-0 z-30"
      style={{ background: "var(--bg-base)", borderRight: "1px solid var(--border-subtle)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-14" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--accent-subtle)", border: "1px solid rgba(124,92,255,0.2)" }}
        >
          <Zap className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
        </div>
        <span className="font-display font-bold tracking-tight" style={{ color: "var(--text-primary)", fontSize: "0.938rem" }}>
          SpendWise
        </span>
        <span
          className="ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded"
          style={{
            background: "var(--accent-subtle)",
            color: "var(--accent)",
            letterSpacing: "0.04em",
          }}
        >
          AI
        </span>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 py-4 overflow-y-auto no-scrollbar">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-5">
            <p
              className="px-5 mb-1.5 font-medium uppercase tracking-widest"
              style={{ color: "var(--text-tertiary)", fontSize: "0.62rem", letterSpacing: "0.09em" }}
            >
              {section.label}
            </p>
            <div className="px-3 space-y-0.5">
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = activeHref === href;
                return (
                  <Link key={href} href={href}>
                    <div className="relative">
                      {/* Glide pill — layoutId makes it animate between items */}
                      {active && (
                        <motion.div
                          layoutId="nav-active-pill"
                          className="absolute inset-0 rounded-md"
                          style={{ background: "var(--bg-overlay)" }}
                          transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        />
                      )}
                      {/* Active left bar */}
                      {active && (
                        <motion.div
                          layoutId="nav-active-bar"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-full"
                          style={{ height: 18, background: "var(--accent)" }}
                          transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        />
                      )}
                      <motion.div
                        whileHover={{ x: 1 }}
                        transition={{ duration: 0.15 }}
                        className="relative flex items-center gap-3 px-4 rounded-md cursor-pointer"
                        style={{
                          height: 34,
                          color: active ? "var(--text-primary)" : "var(--text-secondary)",
                          transition: "color 150ms ease, background 150ms ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!active) {
                            const el = e.currentTarget;
                            el.style.background = "var(--bg-overlay)";
                            el.style.color = "var(--text-primary)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            const el = e.currentTarget;
                            el.style.background = "";
                            el.style.color = "var(--text-secondary)";
                          }
                        }}
                      >
                        <Icon
                          className="flex-shrink-0"
                          style={{
                            width: 15,
                            height: 15,
                            color: active ? "var(--text-primary)" : "var(--text-tertiary)",
                          }}
                        />
                        <span style={{ fontSize: "0.813rem", fontWeight: active ? 500 : 400 }}>
                          {label}
                        </span>
                      </motion.div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* XP bar */}
      <div className="px-5 pb-3 pt-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="flex justify-between mb-1.5" style={{ color: "var(--text-tertiary)", fontSize: "0.70rem" }}>
          <span>Level {level}</span>
          <span>{xpInLevel}/100 XP</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-overlay)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, var(--accent), #A78BFA)" }}
            initial={{ width: 0 }}
            animate={{ width: `${xpInLevel}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* User card */}
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <div
          className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
          style={{ background: "linear-gradient(135deg, var(--accent), #A78BFA)" }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate font-medium" style={{ color: "var(--text-primary)", fontSize: "0.813rem" }}>
            {user?.name ?? "User"}
          </p>
          <p className="truncate" style={{ color: "var(--text-tertiary)", fontSize: "0.70rem" }}>
            {user?.email}
          </p>
        </div>
        <button
          onClick={logout}
          className="btn-icon flex-shrink-0"
          title="Logout"
          style={{ width: 28, height: 28 }}
        >
          <LogOut style={{ width: 13, height: 13, color: "var(--text-tertiary)" }} />
        </button>
      </div>
    </aside>
  );
}
