import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import toast from "react-hot-toast";
import type { AdminStatsResponse, AdminUsersResponse } from "@/types/admin";

export function useAdminStats() {
  return useQuery<AdminStatsResponse>({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const { data } = await api.get("/admin/stats");
      return data;
    },
    staleTime: 30_000,
  });
}

export function useAdminUsers(page = 1, search = "") {
  return useQuery<AdminUsersResponse>({
    queryKey: ["admin", "users", page, search],
    queryFn: async () => {
      const { data } = await api.get("/admin/users", { params: { page, per_page: 20, search } });
      return data;
    },
    staleTime: 30_000,
  });
}

export function useBroadcast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { title: string; message: string; target: string }) => {
      const { data } = await api.post("/admin/broadcast", body);
      return data as { sent_to: number };
    },
    onSuccess: (data) => {
      toast.success(`Broadcast sent to ${data.sent_to} users`);
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: () => toast.error("Failed to send broadcast"),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      toast.success("User deleted");
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.detail ?? "Failed to delete user"),
  });
}

export function useAdminChat() {
  return useMutation({
    mutationFn: async (body: { message: string; history: { role: string; content: string }[] }) => {
      const { data } = await api.post("/admin/chat", body);
      return data as { reply: string };
    },
  });
}
