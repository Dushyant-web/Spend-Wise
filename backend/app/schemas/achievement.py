from datetime import datetime
from pydantic import BaseModel, ConfigDict


class AchievementSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str  # badge_id used as logical ID
    badge_id: str
    badge_name: str
    xp_awarded: int
    earned_at: datetime


class BadgeDefinition(BaseModel):
    badge_id: str
    badge_name: str
    description: str
    emoji: str
    xp: int
    category: str  # "streak" | "expense" | "budget" | "social" | "special"
    rarity: str    # "common" | "rare" | "epic" | "legendary"


class UserAchievementsResponse(BaseModel):
    earned: list[AchievementSchema]
    total_xp: int
    current_level: int
    current_streak: int
    longest_streak: int
    xp_to_next_level: int
    level_name: str
    smart_spender_rank: str


class AllBadgesResponse(BaseModel):
    badges: list[BadgeDefinition]
    earned_ids: list[str]
