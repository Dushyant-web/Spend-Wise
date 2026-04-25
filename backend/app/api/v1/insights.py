from fastapi import APIRouter

from app.core.dependencies import CurrentUser, DBSession
from app.services.insights_service import InsightsService

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("", response_model=list[dict])
async def get_insights(
    db: DBSession,
    current_user: CurrentUser,
):
    svc = InsightsService(db)
    return await svc.get_insights(current_user.id)
