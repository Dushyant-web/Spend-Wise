"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { User, Wallet, Lock, Trash2, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import dynamic from "next/dynamic";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

const SettingsOrb = dynamic(() => import("@/components/three/SettingsOrb"), { ssr: false });

/* ── schemas ────────────────────────────────────────────────────── */
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  college: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
});

const financeSchema = z.object({
  monthly_income: z.coerce.number().min(0, "Must be 0 or more"),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Required"),
    new_password: z.string().min(8, "At least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type ProfileValues = z.infer<typeof profileSchema>;
type FinanceValues = z.infer<typeof financeSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

/* ── section card ───────────────────────────────────────────────── */
function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ style?: React.CSSProperties; className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      background: "var(--bg-base)", border: "1px solid var(--border-subtle)",
      borderRadius: 16, padding: "20px 24px",
    }}>
      <div className="flex items-center gap-2 mb-5">
        <div style={{
          width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center",
          justifyContent: "center", background: "var(--accent-subtle)",
        }}>
          <Icon style={{ width: 14, height: 14, color: "var(--accent)" }} />
        </div>
        <h2 style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 600 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label style={{ color: "var(--text-secondary)", fontSize: "0.75rem", fontWeight: 500 }}>{label}</label>
      {children}
      {error && <p style={{ color: "var(--danger)", fontSize: "0.75rem" }}>{error}</p>}
    </div>
  );
}

/* ── page ───────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  /* profile form */
  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      college: user?.college ?? "",
      city: user?.city ?? "",
      phone: user?.phone ?? "",
    },
  });

  /* finance form */
  const financeForm = useForm<FinanceValues>({
    resolver: zodResolver(financeSchema),
    defaultValues: { monthly_income: Number(user?.monthly_income ?? 0) },
  });

  /* password form */
  const pwForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  const saveProfile = async (v: ProfileValues) => {
    try {
      const { data } = await api.put("/users/me", v);
      updateUser(data);
      toast.success("Profile updated");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Failed to update profile");
    }
  };

  const saveFinance = async (v: FinanceValues) => {
    try {
      const { data } = await api.put("/users/me", { monthly_income: v.monthly_income });
      updateUser(data);
      toast.success("Income updated");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Failed to update");
    }
  };

  const changePassword = async (v: PasswordValues) => {
    try {
      await api.post("/users/me/change-password", {
        current_password: v.current_password,
        new_password: v.new_password,
      });
      toast.success("Password changed successfully");
      pwForm.reset();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Failed to change password");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-8 pb-24 lg:pb-8 space-y-5">

      {/* Hero with SettingsOrb */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden flex items-center justify-between rounded-2xl"
        style={{
          background: "var(--bg-base)", border: "1px solid var(--border-subtle)",
          padding: "20px 24px", minHeight: 100,
        }}
      >
        <div style={{
          position: "absolute", inset: 0, opacity: 0.07,
          background: "radial-gradient(ellipse at 80% 50%, var(--accent), transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative" }}>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.813rem" }}>Account preferences</p>
          <h1 className="font-display font-bold mt-0.5" style={{ color: "var(--text-primary)", fontSize: "1.4rem", letterSpacing: "-0.02em" }}>
            Settings
          </h1>
        </div>
        <div style={{ width: 90, height: 90, pointerEvents: "none", position: "relative", zIndex: 1 }} className="hidden sm:block">
          <SettingsOrb />
        </div>
      </motion.div>

      {/* Profile */}
      <Section icon={User} title="Profile">
        <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name" error={profileForm.formState.errors.name?.message}>
              <input className="input" {...profileForm.register("name")} />
            </Field>
            <Field label="Phone (optional)">
              <input className="input" placeholder="+91 98765 43210" {...profileForm.register("phone")} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="College">
              <input className="input" placeholder="IIT Delhi" {...profileForm.register("college")} />
            </Field>
            <Field label="City">
              <input className="input" placeholder="Delhi" {...profileForm.register("city")} />
            </Field>
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={profileForm.formState.isSubmitting}
            className="btn btn-primary"
            style={{ opacity: profileForm.formState.isSubmitting ? 0.6 : 1 }}
          >
            <Check style={{ width: 14, height: 14 }} />
            {profileForm.formState.isSubmitting ? "Saving…" : "Save Profile"}
          </motion.button>
        </form>
      </Section>

      {/* Finance */}
      <Section icon={Wallet} title="Financial Info">
        <form onSubmit={financeForm.handleSubmit(saveFinance)} className="space-y-4">
          <Field label="Monthly Income / Pocket Money (₹)" error={financeForm.formState.errors.monthly_income?.message}>
            <input
              type="number"
              step="100"
              className="input"
              placeholder="e.g. 12000"
              {...financeForm.register("monthly_income")}
            />
          </Field>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.75rem" }}>
            Used for spending ratio calculations and AI insights. Not shared with anyone.
          </p>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={financeForm.formState.isSubmitting}
            className="btn btn-primary"
            style={{ opacity: financeForm.formState.isSubmitting ? 0.6 : 1 }}
          >
            <Check style={{ width: 14, height: 14 }} />
            {financeForm.formState.isSubmitting ? "Saving…" : "Save"}
          </motion.button>
        </form>
      </Section>

      {/* Password */}
      <Section icon={Lock} title="Change Password">
        <form onSubmit={pwForm.handleSubmit(changePassword)} className="space-y-4">
          <Field label="Current Password" error={pwForm.formState.errors.current_password?.message}>
            <input type="password" className="input" placeholder="••••••••" {...pwForm.register("current_password")} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="New Password" error={pwForm.formState.errors.new_password?.message}>
              <input type="password" className="input" placeholder="Min. 8 chars" {...pwForm.register("new_password")} />
            </Field>
            <Field label="Confirm New Password" error={pwForm.formState.errors.confirm_password?.message}>
              <input type="password" className="input" placeholder="••••••••" {...pwForm.register("confirm_password")} />
            </Field>
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={pwForm.formState.isSubmitting}
            className="btn btn-secondary"
            style={{ opacity: pwForm.formState.isSubmitting ? 0.6 : 1 }}
          >
            <Lock style={{ width: 14, height: 14 }} />
            {pwForm.formState.isSubmitting ? "Updating…" : "Update Password"}
          </motion.button>
        </form>
      </Section>

      {/* Danger zone */}
      <Section icon={Trash2} title="Danger Zone">
        <p style={{ color: "var(--text-tertiary)", fontSize: "0.875rem", marginBottom: 16 }}>
          Permanently delete your account and all your expense data. This cannot be undone.
        </p>
        {!deleteConfirm ? (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="btn btn-danger"
          >
            <Trash2 style={{ width: 14, height: 14 }} />
            Delete my account
          </button>
        ) : (
          <div style={{
            padding: 16, borderRadius: 10, border: "1px solid rgba(240,86,114,0.3)",
            background: "rgba(240,86,114,0.05)",
          }} className="space-y-3">
            <p style={{ color: "var(--danger)", fontSize: "0.875rem", fontWeight: 500 }}>
              Are you absolutely sure?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const pw = prompt("Enter your password to confirm:");
                  if (!pw) return;
                  try {
                    await api.delete("/users/me", { data: { password: pw } });
                    toast.success("Account deleted");
                    window.location.href = "/login";
                  } catch (e: any) {
                    toast.error(e?.response?.data?.detail ?? "Failed");
                    setDeleteConfirm(false);
                  }
                }}
                className="btn btn-danger"
              >
                Yes, delete permanently
              </button>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}
