from fastapi import APIRouter

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.analytics import AnalyticsResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("", response_model=AnalyticsResponse)
async def get_analytics(
    db: DBSession,
    current_user: CurrentUser,
):
    svc = AnalyticsService(db)
    return await svc.get_full_analytics(current_user.id)
