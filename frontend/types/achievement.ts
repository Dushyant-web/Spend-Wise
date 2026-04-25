export interface AchievementSchema {
  id: string;
  badge_id: string;
  badge_name: string;
  xp_awarded: number;
  earned_at: string;
}

export interface BadgeDefinition {
  badge_id: string;
  badge_name: string;
  description: string;
  emoji: string;
  xp: number;
  category: "streak" | "expense" | "budget" | "special";
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface UserAchievementsResponse {
  earned: AchievementSchema[];
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  xp_to_next_level: number;
  level_name: string;
  smart_spender_rank: string;
}

export interface AllBadgesResponse {
  badges: BadgeDefinition[];
  earned_ids: string[];
}
