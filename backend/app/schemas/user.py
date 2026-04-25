import uuid
from datetime import datetime, date
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


class UserStatsSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_xp: int
    current_level: int
    current_streak: int
    longest_streak: int
    last_active_date: Optional[date] = None
    total_saved: Decimal
    monthly_challenges_completed: int
    smart_spender_rank: str


class UserSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    email: EmailStr
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    college: Optional[str] = None
    city: Optional[str] = None
    monthly_income: Decimal
    auth_provider: str
    is_verified: bool
    is_active: bool
    is_admin: bool
    onboarding_done: bool
    last_login_at: Optional[datetime] = None
    created_at: datetime
    stats: Optional[UserStatsSchema] = None


class UpdateUserRequest(BaseModel):
    name: Optional[str] = None
    college: Optional[str] = None
    city: Optional[str] = None
    monthly_income: Optional[Decimal] = None
    phone: Optional[str] = None


class OnboardingRequest(BaseModel):
    monthly_income: Decimal
    monthly_limit: Decimal
    college: Optional[str] = None
    city: Optional[str] = None


class OnboardingResponse(BaseModel):
    user: UserSchema
    message: str = "Onboarding complete! Welcome to SpendWise AI."


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class DeleteAccountRequest(BaseModel):
    password: str
