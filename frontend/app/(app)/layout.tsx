"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MobileNav from "@/components/layout/MobileNav";
import QuickAddModal from "@/components/modals/QuickAddModal";
import { useAuthStore } from "@/stores/authStore";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  // Global ⌘K / Ctrl+K shortcut for QuickAdd
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setQuickAddOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-canvas)", color: "var(--text-primary)" }}>
      <Sidebar />
      <div className="lg:pl-60 flex flex-col min-h-screen">
        <TopBar onAddExpense={() => setAddExpenseOpen(true)} />
        <main className="flex-1 pt-2 pb-24 lg:pb-8">
          {children}
        </main>
      </div>
      <MobileNav />

      {addExpenseOpen && (
        <AddExpenseModalLazy
          open={addExpenseOpen}
          onClose={() => setAddExpenseOpen(false)}
        />
      )}

      <QuickAddModal open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </div>
  );
}

function AddExpenseModalLazy({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [Modal, setModal] = useState<React.ComponentType<{ open: boolean; onClose: () => void }> | null>(null);

  useEffect(() => {
    import("@/components/expenses/AddExpenseModal").then((m) => setModal(() => m.default));
  }, []);

  if (!Modal) return null;
  return <Modal open={open} onClose={onClose} />;
}
