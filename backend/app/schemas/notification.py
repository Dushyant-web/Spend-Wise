import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class NotificationSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    type: str
    title: str
    message: str
    data: dict
    severity: str
    is_seen: bool
    created_at: datetime


class NotificationListResponse(BaseModel):
    items: list[NotificationSchema]
    unread_count: int
