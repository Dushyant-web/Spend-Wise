from pydantic import BaseModel
from datetime import datetime


class CategoryPrediction(BaseModel):
    category: str
    emoji: str
    predicted_amount: float
    avg_last_3_months: float
    trend: str  # "up" | "down" | "stable"
    trend_pct: float


class AnomalyItem(BaseModel):
    expense_id: str
    category: str
    emoji: str
    amount: float
    category_avg: float
    deviation_pct: float
    merchant: str | None
    date: str


class BudgetRecommendation(BaseModel):
    recommended_limit: float
    based_on_months: int
    median_spending: float
    safety_buffer_pct: float
    category_limits: dict[str, float]


class MonthForecast(BaseModel):
    month: int
    year: int
    label: str
    predicted_total: float
    lower_bound: float
    upper_bound: float
    confidence: float


class PredictionResponse(BaseModel):
    next_month_forecast: MonthForecast
    category_predictions: list[CategoryPrediction]
    anomalies: list[AnomalyItem]
    budget_recommendation: BudgetRecommendation
    historical_accuracy: float | None
    generated_at: datetime
    data_months_used: int
