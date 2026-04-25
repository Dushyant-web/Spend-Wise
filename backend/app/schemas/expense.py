import uuid
from datetime import datetime, date
from decimal import Decimal
from enum import Enum
from math import ceil
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator


class CategoryEnum(str, Enum):
    food = "food"
    transport = "transport"
    shopping = "shopping"
    entertainment = "entertainment"
    bills = "bills"
    education = "education"
    rent = "rent"
    subscriptions = "subscriptions"
    emergency = "emergency"
    miscellaneous = "miscellaneous"


class PaymentModeEnum(str, Enum):
    upi = "upi"
    cash = "cash"
    card = "card"
    netbanking = "netbanking"


class RecurringFrequencyEnum(str, Enum):
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"
    yearly = "yearly"


class ExpenseCreate(BaseModel):
    amount: Decimal
    category: CategoryEnum
    subcategory: Optional[str] = None
    merchant: Optional[str] = None
    note: Optional[str] = None
    payment_mode: PaymentModeEnum = PaymentModeEnum.upi
    tags: Optional[list[str]] = None
    expense_date: date = None  # default to today in service
    is_recurring: bool = False
    recurring_frequency: Optional[RecurringFrequencyEnum] = None

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("Amount must be greater than 0")
        return round(v, 2)


class ExpenseUpdate(BaseModel):
    amount: Optional[Decimal] = None
    category: Optional[CategoryEnum] = None
    subcategory: Optional[str] = None
    merchant: Optional[str] = None
    note: Optional[str] = None
    payment_mode: Optional[PaymentModeEnum] = None
    tags: Optional[list[str]] = None
    expense_date: Optional[date] = None

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None and v <= 0:
            raise ValueError("Amount must be greater than 0")
        return v


class ExpenseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    amount: Decimal
    category: str
    subcategory: Optional[str] = None
    merchant: Optional[str] = None
    note: Optional[str] = None
    payment_mode: str
    source: str
    tags: Optional[list[str]] = None
    is_recurring: bool
    receipt_url: Optional[str] = None
    expense_date: date
    created_at: datetime
    updated_at: datetime


class PaginatedExpenseResponse(BaseModel):
    items: list[ExpenseSchema]
    total: int
    page: int
    per_page: int
    pages: int


class ImportCSVResponse(BaseModel):
    imported: int
    skipped: int
    errors: list[str]
