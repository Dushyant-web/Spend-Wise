from fastapi import APIRouter

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.achievement import UserAchievementsResponse, AllBadgesResponse
from app.services.achievement_service import AchievementService

router = APIRouter(prefix="/achievements", tags=["achievements"])


@router.get("", response_model=UserAchievementsResponse)
async def get_my_achievements(
    db: DBSession,
    current_user: CurrentUser,
):
    svc = AchievementService(db)
    return await svc.get_user_achievements(current_user.id)


@router.get("/all", response_model=AllBadgesResponse)
async def get_all_badges(
    db: DBSession,
    current_user: CurrentUser,
):
    svc = AchievementService(db)
    return await svc.get_all_badges(current_user.id)
