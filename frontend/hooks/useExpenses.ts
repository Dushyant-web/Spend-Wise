"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  Expense,
  ExpenseCreate,
  ExpenseUpdate,
  ExpenseFilters,
  PaginatedExpenseResponse,
} from "@/types/expense";

export const expenseKeys = {
  all: ["expenses"] as const,
  list: (filters: ExpenseFilters) => ["expenses", "list", filters] as const,
  detail: (id: string) => ["expenses", "detail", id] as const,
};

export function useExpenses(filters: ExpenseFilters = {}) {
  return useQuery({
    queryKey: expenseKeys.list(filters),
    queryFn: async () => {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
      );
      const { data } = await api.get<PaginatedExpenseResponse>("/expenses", { params });
      return data;
    },
  });
}

export function useExpense(id: string) {
  return useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<Expense>(`/expenses/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ExpenseCreate) => {
      const { data } = await api.post<Expense>("/expenses", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: expenseKeys.all });
      qc.invalidateQueries({ queryKey: ["budget"] });
    },
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: ExpenseUpdate & { id: string }) => {
      const { data } = await api.put<Expense>(`/expenses/${id}`, payload);
      return data;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: expenseKeys.all });
      qc.invalidateQueries({ queryKey: expenseKeys.detail(id) });
      qc.invalidateQueries({ queryKey: ["budget"] });
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/expenses/${id}`);
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: expenseKeys.all });
      qc.invalidateQueries({ queryKey: ["budget"] });
    },
  });
}
