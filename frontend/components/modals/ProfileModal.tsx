"use client";

import { motion } from "framer-motion";
import { User, MapPin, GraduationCap, Zap, Flame, Trophy, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import Modal from "./Modal";
import { useAuthStore } from "@/stores/authStore";
import { useAuth } from "@/hooks/useAuth";
import { getLevelName } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ProfileModal({ open, onClose }: Props) {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  if (!user) return null;

  const xp = (user as any)?.stats?.total_xp ?? 0;
  const level = (user as any)?.stats?.current_level ?? 1;
  const streak = (user as any)?.stats?.current_streak ?? 0;
  const xpInLevel = xp % 100;
  const levelName = getLevelName(level);
  const initials = user.name.slice(0, 2).toUpperCase();

  return (
    <Modal open={open} onClose={onClose} size="sm" hideHeader>
      <div className="p-6 space-y-4">
        {/* Avatar + name */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3 shadow-lg shadow-primary/20"
          >
            {initials}
          </motion.div>
          <h3 className="text-lg font-bold text-white">{user.name}</h3>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>

        {/* Info */}
        <div className="space-y-2">
          {user.college && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <GraduationCap className="w-3.5 h-3.5 text-gray-600" />
              {user.college}
            </div>
          )}
          {user.city && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="w-3.5 h-3.5 text-gray-600" />
              {user.city}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <Zap className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
            <p className="text-base font-bold text-white">Lv.{level}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{levelName}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
            <p className="text-base font-bold text-white">{streak}d</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Streak</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <Trophy className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <p className="text-base font-bold text-white">{xp}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Total XP</p>
          </div>
        </div>

        {/* XP Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Level {level} progress</span>
            <span>{xpInLevel}/100 XP</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpInLevel}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/settings"
            onClick={onClose}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm transition-colors"
          >
            <Settings className="w-4 h-4" /> Edit Profile
          </Link>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              onClose();
              logout();
            }}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: "rgba(240,86,114,0.10)",
              border: "1px solid rgba(240,86,114,0.25)",
              color: "#F05672",
            }}
          >
            <LogOut className="w-4 h-4" /> Log out
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}
