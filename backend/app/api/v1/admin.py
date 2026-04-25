import uuid
from fastapi import APIRouter, Query, status

from app.core.dependencies import CurrentAdmin, DBSession
from app.schemas.admin import (
    AdminStatsResponse,
    AdminUsersResponse,
    BroadcastRequest,
    BroadcastResponse,
    AdminChatRequest,
    AdminChatResponse,
)
from app.services.admin_service import AdminService
from app.services.admin_chat_service import AdminChatService

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats", response_model=AdminStatsResponse)
async def get_stats(db: DBSession, _: CurrentAdmin) -> AdminStatsResponse:
    return await AdminService(db).get_stats()


@router.get("/users", response_model=AdminUsersResponse)
async def list_users(
    db: DBSession,
    _: CurrentAdmin,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str = Query(""),
) -> AdminUsersResponse:
    return await AdminService(db).list_users(page, per_page, search)


@router.post("/broadcast", response_model=BroadcastResponse)
async def broadcast(
    body: BroadcastRequest,
    db: DBSession,
    _: CurrentAdmin,
) -> BroadcastResponse:
    sent = await AdminService(db).broadcast_notification(body.title, body.message, body.target)
    return BroadcastResponse(sent_to=sent)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: uuid.UUID,
    db: DBSession,
    current_admin: CurrentAdmin,
) -> None:
    await AdminService(db).delete_user(user_id, current_admin)


@router.post("/chat", response_model=AdminChatResponse)
async def admin_chat(
    body: AdminChatRequest,
    db: DBSession,
    _: CurrentAdmin,
) -> AdminChatResponse:
    reply = await AdminChatService(db).chat(body.message, body.history)
    return AdminChatResponse(reply=reply)
