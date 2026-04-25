from pydantic import BaseModel


class CategoryBreakdownItem(BaseModel):
    category: str
    amount: float
    percentage: float
    count: int
    emoji: str


class MonthlyTrendItem(BaseModel):
    month: int
    year: int
    label: str
    total: float
    budget: float | None
    count: int


class DailySpendingItem(BaseModel):
    day: int
    date: str
    amount: float
    cumulative: float


class TopMerchantItem(BaseModel):
    merchant: str
    amount: float
    count: int
    category: str


class PaymentModeItem(BaseModel):
    mode: str
    amount: float
    count: int
    percentage: float


class OverviewResponse(BaseModel):
    total_spent: float
    transaction_count: int
    avg_per_transaction: float
    avg_per_day: float
    top_category: str | None
    top_category_amount: float
    compared_to_last_month: float
    projected_monthly: float
    days_elapsed: int
    days_in_month: int


class AnalyticsResponse(BaseModel):
    overview: OverviewResponse
    category_breakdown: list[CategoryBreakdownItem]
    monthly_trend: list[MonthlyTrendItem]
    daily_spending: list[DailySpendingItem]
    top_merchants: list[TopMerchantItem]
    payment_modes: list[PaymentModeItem]
