import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator


class BudgetCreate(BaseModel):
    monthly_limit: Decimal
    category_limits: dict[str, float] = {}
    savings_goal: Optional[Decimal] = Decimal("0")
    rollover_enabled: bool = False

    @field_validator("monthly_limit")
    @classmethod
    def validate_limit(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("Monthly limit must be greater than 0")
        return v


class BudgetUpdate(BaseModel):
    monthly_limit: Optional[Decimal] = None
    category_limits: Optional[dict[str, float]] = None
    savings_goal: Optional[Decimal] = None
    rollover_enabled: Optional[bool] = None


class BudgetSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    month: int
    year: int
    monthly_limit: Decimal
    category_limits: dict
    rollover_enabled: bool
    savings_goal: Decimal
    created_at: datetime
    updated_at: datetime


class CategorySpendingSchema(BaseModel):
    category: str
    budget: float
    spent: float
    remaining: float
    percentage: float


class BudgetWithSpendingSchema(BudgetSchema):
    spending_so_far: Decimal
    remaining_budget: Decimal
    percentage_used: float
    daily_average: float
    days_elapsed: int
    days_in_month: int
    category_spending: list[CategorySpendingSchema]


class BudgetHistoryItem(BudgetSchema):
    actual_spending: float
    percentage_used: float
