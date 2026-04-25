"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, TrendingUp, Activity, IndianRupee,
  UserPlus, Megaphone, Search, ChevronLeft, ChevronRight, Trash2, BarChart3,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useAdminStats, useAdminUsers, useBroadcast, useDeleteUser } from "@/hooks/useAdmin";
import { useAuthStore } from "@/stores/authStore";
import { formatDistanceToNow } from "date-fns";
import UserDetailModal from "@/components/modals/UserDetailModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import Modal from "@/components/modals/Modal";

const AdminGlobe = dynamic(() => import("@/components/three/AdminGlobe"), { ssr: false });
const AdminChatbot = dynamic(() => import("@/components/admin/AdminChatbot"), { ssr: false });

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

const STAT_COLORS = ["var(--accent)", "var(--success)", "#A78BFA", "var(--warning)", "#34D399", "var(--danger)"];

function StatCard({ icon: Icon, label, value, accentColor }: {
  icon: any; label: string; value: string | number; accentColor: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2 }}
      style={{
        background: "var(--bg-base)", border: "1px solid var(--border-subtle)",
        borderRadius: 12, padding: "16px 18px", position: "relative", overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute", inset: 0, opacity: 0.06,
        background: `radial-gradient(ellipse at top left, ${accentColor}, transparent 70%)`,
      }} />
      <div
        style={{
          width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center",
          justifyContent: "center", marginBottom: 10, position: "relative",
          background: `${accentColor}22`,
        }}
      >
        <Icon style={{ width: 14, height: 14, color: accentColor }} />
      </div>
      <p className="font-display font-bold tabular-nums" style={{ color: "var(--text-primary)", fontSize: "1.375rem", position: "relative" }}>
        {value}
      </p>
      <p style={{ color: "var(--text-tertiary)", fontSize: "0.75rem", marginTop: 4, position: "relative" }}>{label}</p>
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading: loadingStats } = useAdminStats();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const { data: users, isLoading: loadingUsers } = useAdminUsers(page, search);
  const broadcast = useBroadcast();
  const deleteUser = useDeleteUser();
  const currentUser = useAuthStore((s) => s.user);

  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [bTitle, setBTitle] = useState("");
  const [bMessage, setBMessage] = useState("");
  const [bTarget, setBTarget] = useState("all");

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  const handleBroadcast = () => {
    if (!bTitle.trim() || !bMessage.trim()) return;
    broadcast.mutate({ title: bTitle, message: bMessage, target: bTarget }, {
      onSuccess: () => { setBroadcastOpen(false); setBTitle(""); setBMessage(""); },
    });
  };

  const cardStyle = {
    background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: 16,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 pb-8 pt-4 space-y-5">

      {/* Hero with AdminGlobe */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden flex items-center justify-between rounded-2xl"
        style={{ ...cardStyle, padding: "20px 24px", minHeight: 120 }}
      >
        <div style={{
          position: "absolute", inset: 0, opacity: 0.07,
          background: "radial-gradient(ellipse at 80% 50%, var(--success), transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative" }}>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.813rem" }}>Platform overview</p>
          <h1 className="font-display font-bold mt-0.5" style={{ color: "var(--text-primary)", fontSize: "1.4rem", letterSpacing: "-0.02em" }}>
            Admin Dashboard
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.813rem", marginTop: 4 }}>
            SpendWise AI — click user row for details
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div style={{ width: 110, height: 110, pointerEvents: "none" }} className="hidden sm:block">
            <AdminGlobe />
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setBroadcastOpen(true)}
            className="btn"
            style={{
              height: 36, padding: "0 16px", fontSize: "0.813rem",
              background: "rgba(240,86,114,0.1)", color: "var(--danger)",
              border: "1px solid rgba(240,86,114,0.3)", borderRadius: 8,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <Megaphone style={{ width: 13, height: 13 }} /> Broadcast
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      {loadingStats ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 110, borderRadius: 12 }} />
          ))}
        </div>
      ) : stats && (
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={Users}       label="Total Users"          value={stats.total_users.toLocaleString()}                     accentColor={STAT_COLORS[0]} />
          <StatCard icon={Activity}    label="Active Today"         value={stats.active_today}                                     accentColor={STAT_COLORS[1]} />
          <StatCard icon={TrendingUp}  label="Active This Week"     value={stats.active_this_week}                                 accentColor={STAT_COLORS[2]} />
          <StatCard icon={IndianRupee} label="Total Amount Tracked" value={`₹${(stats.total_amount_tracked / 100000).toFixed(1)}L`} accentColor={STAT_COLORS[3]} />
          <StatCard icon={UserPlus}    label="New This Month"       value={stats.new_users_this_month}                             accentColor={STAT_COLORS[4]} />
          <StatCard icon={BarChart3}   label="Total Expenses"       value={stats.total_expenses_logged.toLocaleString()}           accentColor={STAT_COLORS[5]} />
        </motion.div>
      )}

      {/* Top categories */}
      {stats && stats.top_categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ ...cardStyle, padding: "20px 24px" }}
        >
          <h2 style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 600, marginBottom: 16 }}>
            Top Categories
          </h2>
          <div className="space-y-2">
            {stats.top_categories.map((c, i) => (
              <motion.div
                key={c.category}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3"
              >
                <span style={{ color: "var(--text-secondary)", fontSize: "0.813rem", textTransform: "capitalize", width: 120, flexShrink: 0 }}>
                  {c.category}
                </span>
                <div style={{ flex: 1, height: 6, background: "var(--bg-overlay)", borderRadius: 99, overflow: "hidden" }}>
                  <motion.div
                    style={{ height: "100%", borderRadius: 99, background: "var(--accent)" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(c.count / (stats.top_categories[0]?.count || 1)) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                  />
                </div>
                <span style={{ color: "var(--text-tertiary)", fontSize: "0.813rem", width: 52, textAlign: "right" }}>
                  {c.count.toLocaleString()}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Users table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{ ...cardStyle, overflow: "hidden" }}
      >
        <div
          className="flex items-center justify-between p-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <h2 style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 600 }}>Users</h2>
          <form
            onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }}
            className="flex items-center gap-2"
            style={{
              background: "var(--bg-overlay)", borderRadius: 8, padding: "6px 12px",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <Search style={{ width: 13, height: 13, color: "var(--text-tertiary)" }} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search users…"
              className="bg-transparent outline-none w-40"
              style={{ color: "var(--text-primary)", fontSize: "0.813rem" }}
            />
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontSize: "0.813rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                {["Name", "Email", "Level / XP", "Expenses", "Joined", "Status", ""].map((h, i) => (
                  <th
                    key={i}
                    style={{
                      padding: "10px 16px", textAlign: "left",
                      color: "var(--text-tertiary)", fontWeight: 500,
                      fontSize: "0.70rem", textTransform: "uppercase", letterSpacing: "0.06em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} style={{ padding: "12px 16px" }}>
                        <div className="skeleton rounded" style={{ height: 14 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users?.items.map((u, rowIdx) => {
                const isSelf = currentUser?.id === u.id;
                const canDelete = !u.is_admin && !isSelf && u.is_active;
                return (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: rowIdx * 0.03 }}
                    onClick={() => setSelectedUser(u)}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: "1px solid var(--border-subtle)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-overlay)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div className="flex items-center gap-2">
                        <div style={{
                          width: 28, height: 28, borderRadius: "50%", display: "flex",
                          alignItems: "center", justifyContent: "center",
                          background: "var(--accent-subtle)", color: "var(--accent)",
                          fontSize: "0.75rem", fontWeight: 700, flexShrink: 0,
                        }}>
                          {u.name[0]}
                        </div>
                        <span style={{ color: "var(--text-primary)" }}>{u.name}</span>
                        {u.is_admin && (
                          <span style={{
                            fontSize: "0.625rem", padding: "1px 6px", borderRadius: 99,
                            background: "rgba(240,86,114,0.1)", color: "var(--danger)",
                          }}>admin</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-tertiary)" }}>{u.email}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ color: "var(--text-primary)" }}>L{u.current_level}</span>
                      <span style={{ color: "var(--text-tertiary)", marginLeft: 4 }}>· {u.total_xp} XP</span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{u.expense_count}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text-tertiary)", fontSize: "0.75rem" }}>
                      {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        fontSize: "0.70rem", padding: "2px 8px", borderRadius: 99,
                        background: u.is_active ? "rgba(16,201,143,0.1)" : "rgba(240,86,114,0.1)",
                        color: u.is_active ? "var(--success)" : "var(--danger)",
                      }}>
                        {u.is_active ? "active" : "inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); canDelete && setConfirmDelete({ id: u.id, name: u.name }); }}
                        disabled={!canDelete}
                        className="btn-icon transition-colors"
                        style={{
                          width: 28, height: 28,
                          opacity: canDelete ? 1 : 0.3,
                          cursor: canDelete ? "pointer" : "not-allowed",
                        }}
                        onMouseEnter={(e) => { if (canDelete) { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.background = "rgba(240,86,114,0.1)"; } }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = ""; e.currentTarget.style.background = ""; }}
                      >
                        <Trash2 style={{ width: 13, height: 13 }} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {users && users.pages > 1 && (
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            <p style={{ color: "var(--text-tertiary)", fontSize: "0.813rem" }}>
              {users.total} users · page {users.page} of {users.pages}
            </p>
            <div className="flex gap-2">
              {[
                { label: <ChevronLeft style={{ width: 14, height: 14 }} />, disabled: page === 1, action: () => setPage((p) => Math.max(1, p - 1)) },
                { label: <ChevronRight style={{ width: 14, height: 14 }} />, disabled: page === users.pages, action: () => setPage((p) => Math.min(users.pages, p + 1)) },
              ].map((btn, i) => (
                <button
                  key={i}
                  onClick={btn.action}
                  disabled={btn.disabled}
                  className="btn-icon"
                  style={{ width: 30, height: 30, opacity: btn.disabled ? 0.3 : 1 }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* User Detail Modal */}
      <UserDetailModal
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
        currentUserId={currentUser?.id}
        onDelete={(id, name) => { setSelectedUser(null); setConfirmDelete({ id, name }); }}
      />

      {/* Delete confirm */}
      <DeleteConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title={`Delete ${confirmDelete?.name}?`}
        description="The account will be deactivated and email anonymized. Expense data is preserved for audit."
        onConfirm={async () => {
          await new Promise<void>((resolve, reject) => {
            deleteUser.mutate(confirmDelete!.id, {
              onSuccess: () => resolve(),
              onError: reject,
            });
          });
        }}
      />

      {/* Broadcast modal */}
      <Modal open={broadcastOpen} onClose={() => setBroadcastOpen(false)} title="Send Broadcast">
        <div className="p-5 space-y-3">
          <input
            type="text"
            value={bTitle}
            onChange={(e) => setBTitle(e.target.value)}
            placeholder="Notification title"
            className="input"
          />
          <textarea
            value={bMessage}
            onChange={(e) => setBMessage(e.target.value)}
            placeholder="Message body"
            rows={3}
            className="input"
            style={{ resize: "none", height: "auto" }}
          />
          <div className="flex gap-2">
            {(["all", "inactive"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setBTarget(t)}
                className="transition-all capitalize"
                style={{
                  padding: "5px 14px", borderRadius: 99, fontSize: "0.813rem", fontWeight: 500,
                  background: bTarget === t ? "var(--accent)" : "var(--bg-overlay)",
                  color: bTarget === t ? "#fff" : "var(--text-secondary)",
                  border: "1px solid",
                  borderColor: bTarget === t ? "transparent" : "var(--border-subtle)",
                }}
              >
                {t === "all" ? "All users" : "Inactive (7d+)"}
              </button>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setBroadcastOpen(false)}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleBroadcast}
              disabled={broadcast.isPending || !bTitle.trim() || !bMessage.trim()}
              className="btn btn-primary flex-1"
              style={{ opacity: (broadcast.isPending || !bTitle.trim() || !bMessage.trim()) ? 0.5 : 1 }}
            >
              {broadcast.isPending ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      </Modal>

      <AdminChatbot />
    </div>
  );
}
