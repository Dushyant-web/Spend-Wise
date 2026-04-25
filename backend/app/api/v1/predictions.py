from fastapi import APIRouter

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.prediction import PredictionResponse
from app.services.prediction_service import PredictionService

router = APIRouter(prefix="/predictions", tags=["predictions"])


@router.get("", response_model=PredictionResponse)
async def get_predictions(
    db: DBSession,
    current_user: CurrentUser,
):
    svc = PredictionService(db)
    return await svc.get_predictions(current_user.id)
