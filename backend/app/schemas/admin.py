from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from math import ceil


class AdminStatsResponse(BaseModel):
    total_users: int
    active_today: int
    active_this_week: int
    total_expenses_logged: int
    total_amount_tracked: float
    new_users_this_month: int
    top_categories: list[dict]


class AdminUserItem(BaseModel):
    id: str
    name: str
    email: str
    college: Optional[str]
    city: Optional[str]
    is_active: bool
    is_admin: bool
    onboarding_done: bool
    total_xp: int
    current_level: int
    expense_count: int
    created_at: datetime
    last_login_at: Optional[datetime]


class AdminUsersResponse(BaseModel):
    items: list[AdminUserItem]
    total: int
    page: int
    per_page: int
    pages: int


class BroadcastRequest(BaseModel):
    title: str
    message: str
    target: str = "all"  # all | inactive


class BroadcastResponse(BaseModel):
    sent_to: int


class AdminChatRequest(BaseModel):
    message: str
    history: list[dict] = []


class AdminChatResponse(BaseModel):
    reply: str
