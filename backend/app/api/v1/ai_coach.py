from fastapi import APIRouter
from pydantic import BaseModel, field_validator

from app.core.dependencies import CurrentUser, DBSession
from app.services.ai_coach_service import AICoachService

router = APIRouter(prefix="/ai-coach", tags=["AI Coach"])

RATE_LIMIT = 50  # messages per session — enforced client-side; backend trusts auth


class HistoryItem(BaseModel):
    role: str
    content: str


class CoachRequest(BaseModel):
    message: str
    history: list[HistoryItem] = []

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Message cannot be empty")
        return v[:800]


class CoachResponse(BaseModel):
    reply: str


@router.post("", response_model=CoachResponse)
async def coach_chat(
    body: CoachRequest,
    db: DBSession,
    current_user: CurrentUser,
) -> CoachResponse:
    svc = AICoachService(db)
    history = [{"role": h.role, "content": h.content} for h in body.history]
    reply = await svc.chat(str(current_user.id), body.message, history)
    return CoachResponse(reply=reply)
