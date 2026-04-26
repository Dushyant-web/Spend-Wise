"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Plus, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";
import NotificationDropdown from "@/components/layout/NotificationDropdown";
import ProfileModal from "@/components/modals/ProfileModal";

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  "/dashboard":    { title: "Dashboard",    sub: "Overview of your finances" },
  "/expenses":     { title: "Expenses",     sub: "Track every transaction" },
  "/budget":       { title: "Budget",       sub: "Monthly spending limits" },
  "/reports":      { title: "Reports",      sub: "Insights & analytics" },
  "/ai-coach":     { title: "AI Coach",     sub: "Personalized guidance" },
  "/achievements": { title: "Achievements", sub: "Your milestones" },
  "/settings":     { title: "Settings",     sub: "Account preferences" },
};

interface TopBarProps {
  onAddExpense?: () => void;
}

export default function TopBar({ onAddExpense }: TopBarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);

  const page = Object.entries(PAGE_TITLES).find(([path]) =>
    pathname === path || pathname.startsWith(`${path}/`)
  )?.[1] ?? { title: "SpendWise", sub: "" };

  const initials = user?.name?.slice(0, 2).toUpperCase() ?? "U";

  return (
    <>
      <header
        className="lg:hidden h-14 sticky top-0 z-20 flex items-center justify-between px-4"
        style={{
          background: "var(--bg-base)",
          borderBottom: "1px solid var(--border-subtle)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div>
          <p className="font-display font-semibold" style={{ color: "var(--text-primary)", fontSize: "0.938rem" }}>
            {page.title}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onAddExpense && (
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={onAddExpense}
              className="btn btn-primary"
              style={{ height: 32, paddingLeft: 12, paddingRight: 12, fontSize: "0.813rem" }}
            >
              <Plus style={{ width: 14, height: 14 }} />
              Add
            </motion.button>
          )}

          <NotificationDropdown />

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setProfileOpen(true)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, var(--accent), #00C9A7)" }}
            title="Profile"
          >
            {initials}
          </motion.button>
        </div>
      </header>

      {/* Desktop page header — inside content area, not fixed */}
      <div
        className="hidden lg:flex items-center justify-between px-8 pt-6 pb-2"
      >
        <div>
          <h1
            className="font-display font-bold"
            style={{ color: "var(--text-primary)", fontSize: "1.5rem", letterSpacing: "-0.02em" }}
          >
            {page.title}
          </h1>
          {page.sub && (
            <p style={{ color: "var(--text-tertiary)", fontSize: "0.813rem", marginTop: 2 }}>
              {page.sub}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onAddExpense && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={onAddExpense}
              className="btn btn-primary"
            >
              <Plus style={{ width: 15, height: 15 }} />
              Add Expense
            </motion.button>
          )}
          <NotificationDropdown />
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setProfileOpen(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, var(--accent), #00C9A7)",
              boxShadow: "0 0 0 2px var(--bg-base), 0 0 0 3px var(--border-subtle)",
            }}
            title="Profile"
          >
            {initials}
          </motion.button>
        </div>
      </div>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
