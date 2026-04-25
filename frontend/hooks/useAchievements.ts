import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { UserAchievementsResponse, AllBadgesResponse } from "@/types/achievement";

export function useMyAchievements() {
  return useQuery<UserAchievementsResponse>({
    queryKey: ["achievements", "me"],
    queryFn: async () => {
      const { data } = await api.get("/achievements");
      return data;
    },
    staleTime: 60_000,
  });
}

export function useAllBadges() {
  return useQuery<AllBadgesResponse>({
    queryKey: ["achievements", "all"],
    queryFn: async () => {
      const { data } = await api.get("/achievements/all");
      return data;
    },
    staleTime: 5 * 60_000,
  });
}
