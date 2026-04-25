"use client";

import { motion } from "framer-motion";
import { Bell, CheckCircle, Clock } from "lucide-react";
import Modal from "./Modal";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  type?: string;
  is_read: boolean;
  created_at: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  notification: Notification | null;
}

const TYPE_ICON: Record<string, string> = {
  achievement: "🏆",
  budget: "💰",
  insight: "💡",
  streak: "🔥",
  info: "ℹ️",
};

export default function NotificationDetailModal({ open, onClose, notification }: Props) {
  if (!notification) return null;
  const icon = TYPE_ICON[notification.type ?? "info"] ?? "🔔";

  return (
    <Modal open={open} onClose={onClose} hideHeader size="sm">
      <div className="p-6 space-y-4">
        <motion.div
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-2xl"
        >
          {icon}
        </motion.div>

        <div className="text-center">
          <h3 className="text-base font-bold text-white mb-2">{notification.title}</h3>
          <p className="text-sm text-gray-300 leading-relaxed">{notification.message}</p>
        </div>

        <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </span>
          {notification.is_read && (
            <span className="flex items-center gap-1 text-secondary">
              <CheckCircle className="w-3 h-3" /> Read
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
