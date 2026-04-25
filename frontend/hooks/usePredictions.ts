"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { PredictionResponse } from "@/types/prediction";
import type { BudgetCreate } from "@/types/budget";
import { budgetKeys } from "@/hooks/useBudget";

export const predictionKeys = {
  all: ["predictions"] as const,
  current: () => ["predictions", "current"] as const,
};

export function usePredictions() {
  return useQuery({
    queryKey: predictionKeys.current(),
    queryFn: async () => {
      const { data } = await api.get<PredictionResponse>("/predictions");
      return data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour — predictions are expensive
  });
}

export function useApplyRecommendedBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BudgetCreate) => {
      // Try update first, create if 404
      try {
        const { data } = await api.put("/budget/current", payload);
        return data;
      } catch (e: any) {
        if (e?.response?.status === 404) {
          const { data } = await api.post("/budget", payload);
          return data;
        }
        throw e;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: budgetKeys.all });
    },
  });
}
