"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES, PAYMENT_MODES, MONTHS } from "@/lib/constants";
import type { ExpenseFilters } from "@/types/expense";

interface Props {
  filters: ExpenseFilters;
  onChange: (f: Partial<ExpenseFilters>) => void;
  onReset: () => void;
}

export default function ExpenseFilters({ filters, onChange, onReset }: Props) {
  const hasActive =
    filters.category ||
    filters.payment_mode ||
    filters.search ||
    filters.month ||
    filters.year;

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search merchant, note…"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ search: e.target.value || undefined, page: 1 })}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 text-sm"
        />
      </div>

      {/* Row filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <SlidersHorizontal className="w-4 h-4 text-gray-500 flex-shrink-0" />

        <select
          value={filters.category ?? ""}
          onChange={(e) => onChange({ category: e.target.value || undefined, page: 1 })}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary/50 appearance-none min-w-[130px]"
        >
          <option value="" className="bg-gray-900">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value} className="bg-gray-900">
              {c.emoji} {c.label}
            </option>
          ))}
        </select>

        <select
          value={filters.payment_mode ?? ""}
          onChange={(e) => onChange({ payment_mode: e.target.value || undefined, page: 1 })}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary/50 appearance-none min-w-[120px]"
        >
          <option value="" className="bg-gray-900">All Modes</option>
          {PAYMENT_MODES.map((m) => (
            <option key={m.value} value={m.value} className="bg-gray-900">
              {m.icon} {m.label}
            </option>
          ))}
        </select>

        <select
          value={filters.month ?? ""}
          onChange={(e) =>
            onChange({ month: e.target.value ? Number(e.target.value) : undefined, page: 1 })
          }
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary/50 appearance-none min-w-[110px]"
        >
          <option value="" className="bg-gray-900">All Months</option>
          {MONTHS.map((m, i) => (
            <option key={i + 1} value={i + 1} className="bg-gray-900">{m}</option>
          ))}
        </select>

        <select
          value={filters.year ?? ""}
          onChange={(e) =>
            onChange({ year: e.target.value ? Number(e.target.value) : undefined, page: 1 })
          }
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary/50 appearance-none min-w-[90px]"
        >
          <option value="" className="bg-gray-900">All Years</option>
          {[2024, 2025, 2026].map((y) => (
            <option key={y} value={y} className="bg-gray-900">{y}</option>
          ))}
        </select>

        {hasActive && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors ml-auto"
          >
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
