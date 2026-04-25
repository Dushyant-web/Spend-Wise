"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { InsightCard, NotificationListResponse } from "@/types/notification";

export const notifKeys = {
  all: ["notifications"] as const,
  list: () => ["notifications", "list"] as const,
  insights: () => ["insights"] as const,
};

export function useNotifications() {
  return useQuery({
    queryKey: notifKeys.list(),
    queryFn: async () => {
      const { data } = await api.get<NotificationListResponse>("/notifications");
      return data;
    },
    refetchInterval: 60_000,
  });
}

export function useInsights() {
  return useQuery({
    queryKey: notifKeys.insights(),
    queryFn: async () => {
      const { data } = await api.get<InsightCard[]>("/insights");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: notifKeys.list() }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post("/notifications/read-all");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: notifKeys.list() }),
  });
}
