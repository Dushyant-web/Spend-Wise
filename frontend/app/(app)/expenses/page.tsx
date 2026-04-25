"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Upload } from "lucide-react";
import dynamic from "next/dynamic";
import { useExpenses } from "@/hooks/useExpenses";
import ExpenseFilters from "@/components/expenses/ExpenseFilters";
import ExpenseList from "@/components/expenses/ExpenseList";
import AddExpenseModal from "@/components/expenses/AddExpenseModal";
import EditExpenseModal from "@/components/expenses/EditExpenseModal";
import ImportCSVModal from "@/components/expenses/ImportCSVModal";
import ExpenseDetailModal from "@/components/modals/ExpenseDetailModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import type { Expense, ExpenseFilters as Filters } from "@/types/expense";
import { useDeleteExpense } from "@/hooks/useExpenses";
import { toast } from "react-hot-toast";
import { formatINR } from "@/lib/utils";

const ReceiptStack = dynamic(() => import("@/components/three/ReceiptStack"), { ssr: false });

const DEFAULT_FILTERS: Filters = { page: 1, per_page: 20 };

const cardStyle = {
  background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: 16,
};

export default function ExpensesPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [detailExpense, setDetailExpense] = useState<Expense | null>(null);
  const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null);

  const { data, isLoading, isError } = useExpenses(filters);
  const { mutateAsync: deleteExp } = useDeleteExpense();

  const updateFilters = (partial: Partial<Filters>) =>
    setFilters((prev) => ({ ...prev, ...partial }));

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 pb-24 lg:pb-8 space-y-4">
      {/* Hero header with 3D receipt stack */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden flex items-center justify-between rounded-2xl"
        style={{ ...cardStyle, padding: "20px 24px", minHeight: 100 }}
      >
        <div style={{
          position: "absolute", inset: 0, opacity: 0.06,
          background: "radial-gradient(ellipse at 80% 50%, var(--accent), transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative" }}>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.813rem" }}>Transaction history</p>
          {data ? (
            <p className="font-display font-bold mt-0.5" style={{ color: "var(--text-primary)", fontSize: "1.4rem" }}>
              {data.total} Expenses
            </p>
          ) : (
            <p className="font-display font-bold mt-0.5" style={{ color: "var(--text-primary)", fontSize: "1.4rem" }}>
              All Expenses
            </p>
          )}
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.813rem", marginTop: 4 }}>
            Click any row for details
          </p>
        </div>

        <div
          style={{ width: 100, height: 100, pointerEvents: "none", position: "relative", zIndex: 1 }}
          className="hidden sm:block"
        >
          <ReceiptStack />
        </div>

        <div className="flex items-center gap-2" style={{ position: "absolute", right: 24, bottom: 20 }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setImportOpen(true)}
            className="btn btn-secondary"
            style={{ height: 32, paddingLeft: 12, paddingRight: 12, fontSize: "0.813rem" }}
          >
            <Upload style={{ width: 13, height: 13 }} />
            <span className="hidden sm:inline">Import</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setAddOpen(true)}
            className="btn btn-primary"
            style={{ height: 32, paddingLeft: 12, paddingRight: 12, fontSize: "0.813rem" }}
          >
            <Plus style={{ width: 13, height: 13 }} />
            Add
          </motion.button>
        </div>
      </motion.div>

      {/* Filters */}
      <div style={{ ...cardStyle, padding: "16px 20px" }}>
        <ExpenseFilters
          filters={filters}
          onChange={updateFilters}
          onReset={() => setFilters(DEFAULT_FILTERS)}
        />
      </div>

      {/* List */}
      <div style={{ ...cardStyle, padding: "16px 20px" }}>
        {isLoading ? (
          <div className="space-y-3 py-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton rounded-lg" style={{ width: 36, height: 36, flexShrink: 0 }} />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton rounded" style={{ height: 13, width: "55%" }} />
                  <div className="skeleton rounded" style={{ height: 11, width: "30%" }} />
                </div>
                <div className="skeleton rounded" style={{ height: 14, width: 60 }} />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16" style={{ color: "var(--danger)" }}>
            Failed to load expenses. Please try again.
          </div>
        ) : data ? (
          <ExpenseList
            data={data}
            page={filters.page ?? 1}
            onPageChange={(p) => updateFilters({ page: p })}
            onEdit={(expense) => setEditExpense(expense)}
            onRowClick={(expense) => setDetailExpense(expense)}
          />
        ) : null}
      </div>

      <AddExpenseModal open={addOpen} onClose={() => setAddOpen(false)} />
      <ImportCSVModal open={importOpen} onClose={() => setImportOpen(false)} />

      {editExpense && (
        <EditExpenseModal
          expense={editExpense}
          open={!!editExpense}
          onClose={() => setEditExpense(null)}
        />
      )}

      <ExpenseDetailModal
        open={!!detailExpense}
        onClose={() => setDetailExpense(null)}
        expense={detailExpense}
        onEdit={(exp) => { setDetailExpense(null); setEditExpense(exp); }}
        onDelete={(exp) => { setDetailExpense(null); setDeleteExpense(exp); }}
      />

      <DeleteConfirmModal
        open={!!deleteExpense}
        onClose={() => setDeleteExpense(null)}
        title="Delete Expense"
        description={
          deleteExpense
            ? `Remove ${formatINR(deleteExpense.amount)} from ${deleteExpense.merchant || deleteExpense.category}? This cannot be undone.`
            : ""
        }
        onConfirm={async () => {
          await deleteExp(deleteExpense!.id);
          toast.success("Expense deleted");
          setDeleteExpense(null);
        }}
      />
    </div>
  );
}
