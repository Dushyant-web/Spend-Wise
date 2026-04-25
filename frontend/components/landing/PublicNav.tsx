"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Zap, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LINKS = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export default function PublicNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${
        scrolled
          ? "border-b border-white/[0.06] bg-[#0A0A0F]/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-[#6C63FF] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="font-bold text-lg text-white">SpendWise AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-7 text-sm">
          {LINKS.map((l) => {
            const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative transition-colors ${
                  active ? "text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {l.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1.5 inset-x-0 h-0.5 bg-[#6C63FF] rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden md:block text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="hidden md:inline-flex text-sm px-4 py-2 rounded-xl bg-[#6C63FF] hover:bg-[#5B54E8] text-white font-medium transition-colors"
          >
            Get started free
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden text-white p-1.5 rounded-lg hover:bg-white/5"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden border-t border-white/[0.06] bg-[#0A0A0F]/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <div className="h-px bg-white/[0.06] my-2" />
              <Link
                href="/login"
                className="px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-3 py-2.5 text-sm text-white bg-[#6C63FF] hover:bg-[#5B54E8] rounded-lg text-center font-medium transition-colors"
              >
                Get started free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
