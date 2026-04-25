"use client";

import { motion } from "framer-motion";
import { Mail, Calendar, Activity, IndianRupee, Zap, Shield, Trash2 } from "lucide-react";
import Modal from "./Modal";
import { formatDistanceToNow } from "date-fns";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
  is_active: boolean;
  current_level: number;
  total_xp: number;
  expense_count: number;
  created_at: string;
  last_active?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  user: AdminUser | null;
  onDelete?: (id: string, name: string) => void;
  currentUserId?: string;
}

export default function UserDetailModal({ open, onClose, user, onDelete, currentUserId }: Props) {
  if (!user) return null;
  const isSelf = currentUserId === user.id;
  const canDelete = !user.is_admin && !isSelf && user.is_active;
  const initials = user.name.slice(0, 2).toUpperCase();

  return (
    <Modal open={open} onClose={onClose} hideHeader size="sm">
      <div className="p-6 space-y-4">
        {/* Avatar + name */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white mx-auto mb-3 ${
              user.is_admin ? "bg-gradient-to-br from-red-500 to-orange-500" : "bg-gradient-to-br from-[#6C63FF] to-[#00D4AA]"
            }`}
          >
            {initials}
          </motion.div>
          <h3 className="text-lg font-bold text-white">{user.name}</h3>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${user.is_active ? "bg-[#00D4AA]/10 text-[#00D4AA]" : "bg-red-400/10 text-red-400"}`}>
              {user.is_active ? "Active" : "Inactive"}
            </span>
            {user.is_admin && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-400/10 text-red-400 flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" /> Admin
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <Zap className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-white">L{user.current_level}</p>
            <p className="text-[10px] text-gray-500">{user.total_xp} XP</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <IndianRupee className="w-4 h-4 text-[#00D4AA] mx-auto mb-1" />
            <p className="text-sm font-bold text-white">{user.expense_count}</p>
            <p className="text-[10px] text-gray-500">Expenses</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <Activity className="w-4 h-4 text-[#6C63FF] mx-auto mb-1" />
            <p className="text-sm font-bold text-white">
              {user.last_active ? formatDistanceToNow(new Date(user.last_active), { addSuffix: false }) : "—"}
            </p>
            <p className="text-[10px] text-gray-500">Last active</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Mail className="w-3.5 h-3.5 text-gray-600" /> {user.email}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar className="w-3.5 h-3.5 text-gray-600" />
            Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-colors"
          >
            Close
          </button>
          {canDelete && onDelete && (
            <button
              onClick={() => { onDelete(user.id, user.name); onClose(); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
