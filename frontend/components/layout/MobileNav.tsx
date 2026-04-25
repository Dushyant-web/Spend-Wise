"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, PiggyBank, BarChart3, Trophy } from "lucide-react";
import { motion } from "framer-motion";

const TABS = [
  { href: "/dashboard",    label: "Home",     icon: LayoutDashboard },
  { href: "/expenses",     label: "Expenses", icon: Receipt },
  { href: "/budget",       label: "Budget",   icon: PiggyBank },
  { href: "/reports",      label: "Reports",  icon: BarChart3 },
  { href: "/achievements", label: "Achieve",  icon: Trophy },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 pb-safe"
      style={{
        background: "var(--bg-base)",
        borderTop: "1px solid var(--border-subtle)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="flex h-14">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} className="flex-1">
              <div className="relative flex flex-col items-center justify-center h-full gap-0.5">
                {active && (
                  <motion.div
                    layoutId="mobile-tab-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                    style={{ background: "var(--accent)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  className="flex flex-col items-center gap-0.5"
                  style={{ color: active ? "var(--accent)" : "var(--text-tertiary)" }}
                >
                  <Icon style={{ width: 19, height: 19 }} />
                  <span style={{ fontSize: "0.62rem", fontWeight: active ? 600 : 400 }}>
                    {label}
                  </span>
                </motion.div>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
