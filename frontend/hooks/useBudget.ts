"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  Budget,
  BudgetCreate,
  BudgetUpdate,
  BudgetWithSpending,
  BudgetHistoryItem,
} from "@/types/budget";

export const budgetKeys = {
  all: ["budget"] as const,
  current: () => ["budget", "current"] as const,
  history: () => ["budget", "history"] as const,
};

export function useCurrentBudget() {
  return useQuery({
    queryKey: budgetKeys.current(),
    queryFn: async () => {
      const { data } = await api.get<BudgetWithSpending>("/budget/current");
      return data;
    },
    retry: (count, error: any) => {
      if (error?.response?.status === 404) return false;
      return count < 2;
    },
  });
}

export function useBudgetHistory(limit = 6) {
  return useQuery({
    queryKey: budgetKeys.history(),
    queryFn: async () => {
      const { data } = await api.get<BudgetHistoryItem[]>("/budget/history", {
        params: { limit },
      });
      return data;
    },
  });
}

export function useSetBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BudgetCreate) => {
      const { data } = await api.post<Budget>("/budget", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: budgetKeys.all });
    },
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BudgetUpdate) => {
      const { data } = await api.put<Budget>("/budget/current", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: budgetKeys.all });
    },
  });
}
