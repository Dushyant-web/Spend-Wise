import uuid
from fastapi import APIRouter, status

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.notification import NotificationListResponse
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=NotificationListResponse)
async def list_notifications(
    db: DBSession,
    current_user: CurrentUser,
):
    svc = NotificationService(db)
    return await svc.list_notifications(current_user.id)


@router.patch("/{notification_id}/read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_read(
    notification_id: uuid.UUID,
    db: DBSession,
    current_user: CurrentUser,
):
    svc = NotificationService(db)
    await svc.mark_read(current_user.id, notification_id)


@router.post("/read-all", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_read(
    db: DBSession,
    current_user: CurrentUser,
):
    svc = NotificationService(db)
    await svc.mark_all_read(current_user.id)
