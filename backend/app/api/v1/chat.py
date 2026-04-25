from fastapi import APIRouter, Request
from pydantic import BaseModel, field_validator

from app.redis_client import redis_client
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["Chat"])

_RATE_LIMIT = 10   # requests
_RATE_WINDOW = 60  # seconds


class ChatRequest(BaseModel):
    message: str

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Message cannot be empty")
        return v[:500]


class ChatResponse(BaseModel):
    reply: str


@router.post("", response_model=ChatResponse)
async def public_chat(body: ChatRequest, request: Request) -> ChatResponse:
    ip = request.client.host if request.client else "unknown"
    key = f"chat_rl:{ip}"

    count_raw = await redis_client.get(key)
    count = int(count_raw) if count_raw else 0
    if count >= _RATE_LIMIT:
        return ChatResponse(reply="You've sent a lot of messages! Please sign up and explore SpendWise AI directly.")

    await redis_client.setex(key, _RATE_WINDOW, count + 1)

    svc = ChatService()
    reply = await svc.chat(body.message)
    return ChatResponse(reply=reply)
