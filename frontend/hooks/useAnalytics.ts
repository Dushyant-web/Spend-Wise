"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { AnalyticsResponse } from "@/types/analytics";

export const analyticsKeys = {
  all: ["analytics"] as const,
  current: () => ["analytics", "current"] as const,
};

export function useAnalytics() {
  return useQuery({
    queryKey: analyticsKeys.current(),
    queryFn: async () => {
      const { data } = await api.get<AnalyticsResponse>("/analytics");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
