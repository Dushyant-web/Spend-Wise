"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useNotifications, useMarkRead, useMarkAllRead } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";

const SEVERITY_STYLES = {
  error: "bg-red-400/10 border-red-400/20 text-red-400",
  warning: "bg-yellow-400/10 border-yellow-400/20 text-yellow-400",
  success: "bg-secondary/10 border-secondary/20 text-secondary",
  info: "bg-primary/10 border-primary/20 text-primary",
};

const SEVERITY_DOT = {
  error: "bg-red-400",
  warning: "bg-yellow-400",
  success: "bg-secondary",
  info: "bg-primary",
};

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useNotifications();
  const { mutate: markRead } = useMarkRead();
  const { mutate: markAllRead, isPending: markingAll } = useMarkAllRead();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unread = data?.unread_count ?? 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative text-gray-400 hover:text-white transition-colors p-1.5"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-accent rounded-full text-white text-[9px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-surface-dark border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              {unread > 0 && (
                <button
                  onClick={() => markAllRead()}
                  disabled={markingAll}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors"
                >
                  {markingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading…
                </div>
              ) : !data?.items.length ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                data.items.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.is_seen && markRead(n.id)}
                    className={`flex gap-3 px-4 py-3 border-b border-white/5 last:border-0 cursor-pointer hover:bg-white/3 transition-colors ${
                      !n.is_seen ? "bg-white/2" : ""
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      !n.is_seen
                        ? SEVERITY_DOT[n.severity] ?? "bg-primary"
                        : "bg-transparent"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${n.is_seen ? "text-gray-400" : "text-white"}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
