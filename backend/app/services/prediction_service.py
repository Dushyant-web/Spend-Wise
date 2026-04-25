"""
Spend prediction using linear regression + statistical anomaly detection.
Pure-Python math to stay async-safe — no sklearn/pandas in the hot path.
"""
import uuid
import math
import statistics
from calendar import monthrange
from datetime import date, datetime, timezone
from decimal import Decimal

from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.expense import Expense
from app.models.prediction import Prediction
from app.redis_client import cache_get, cache_set
from app.schemas.prediction import (
    PredictionResponse,
    CategoryPrediction,
    AnomalyItem,
    BudgetRecommendation,
    MonthForecast,
)

import structlog

log = structlog.get_logger()

MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

CATEGORY_EMOJI = {
    "food": "🍽️", "transport": "🚌", "shopping": "🛍️",
    "entertainment": "🎮", "bills": "💡", "education": "📚",
    "rent": "🏠", "subscriptions": "📱", "emergency": "🚨",
    "miscellaneous": "📦",
}

ANOMALY_THRESHOLD = 2.0  # z-score
MIN_SAMPLES_FOR_ANOMALY = 3


def _linear_regression(xs: list[float], ys: list[float]) -> tuple[float, float, float]:
    """Returns (slope, intercept, r_squared)."""
    n = len(xs)
    if n < 2:
        return 0.0, ys[0] if ys else 0.0, 0.0
    sx = sum(xs)
    sy = sum(ys)
    sxy = sum(x * y for x, y in zip(xs, ys))
    sxx = sum(x * x for x in xs)
    syy = sum(y * y for y in ys)
    denom = n * sxx - sx * sx
    if denom == 0:
        return 0.0, sy / n, 0.0
    slope = (n * sxy - sx * sy) / denom
    intercept = (sy - slope * sx) / n
    # R²
    y_mean = sy / n
    ss_tot = sum((y - y_mean) ** 2 for y in ys)
    ss_res = sum((y - (slope * x + intercept)) ** 2 for x, y in zip(xs, ys))
    r2 = 1 - (ss_res / ss_tot) if ss_tot else 0.0
    return slope, intercept, max(0.0, r2)


def _next_month(month: int, year: int) -> tuple[int, int]:
    if month == 12:
        return 1, year + 1
    return month + 1, year


class PredictionService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_predictions(self, user_id: uuid.UUID) -> PredictionResponse:
        today = date.today()
        cache_key = f"predictions:{user_id}:{today.year}:{today.month}"
        cached = await cache_get(cache_key)
        if cached:
            return PredictionResponse(**cached)

        result = await self._compute(user_id, today)
        await cache_set(cache_key, result.model_dump(mode="json"), ttl=3600)
        return result

    async def _compute(self, user_id: uuid.UUID, today: date) -> PredictionResponse:
        # Gather last 6 months of spending
        monthly_totals = await self._get_monthly_totals(user_id, today, months=6)
        category_history = await self._get_category_history(user_id, today, months=6)
        recent_expenses = await self._get_recent_expenses(user_id, limit=60)

        data_months = len([v for v in monthly_totals.values() if v > 0])

        # --- Next-month forecast ---
        nm, ny = _next_month(today.month, today.year)
        forecast = self._forecast_next_month(monthly_totals, nm, ny)

        # --- Per-category predictions ---
        cat_preds = self._predict_categories(category_history, nm, ny)

        # --- Anomaly detection ---
        anomalies = self._detect_anomalies(recent_expenses)

        # --- Budget recommendation ---
        budget_rec = self._recommend_budget(monthly_totals, cat_preds)

        # --- Historical accuracy (compare last prediction vs actual if stored) ---
        accuracy = await self._get_historical_accuracy(user_id, today)

        # Persist prediction
        await self._save_prediction(user_id, nm, ny, forecast, cat_preds)

        return PredictionResponse(
            next_month_forecast=forecast,
            category_predictions=cat_preds,
            anomalies=anomalies,
            budget_recommendation=budget_rec,
            historical_accuracy=accuracy,
            generated_at=datetime.now(timezone.utc),
            data_months_used=data_months,
        )

    async def _get_monthly_totals(
        self, user_id: uuid.UUID, today: date, months: int
    ) -> dict[tuple[int, int], float]:
        result = {}
        m, y = today.month, today.year
        for _ in range(months):
            q = select(func.coalesce(func.sum(Expense.amount), 0)).where(
                Expense.user_id == user_id,
                Expense.is_deleted == False,
                func.extract("month", Expense.expense_date) == m,
                func.extract("year", Expense.expense_date) == y,
            )
            total = float((await self.db.execute(q)).scalar_one())
            result[(m, y)] = total
            m -= 1
            if m == 0:
                m = 12
                y -= 1
        return result

    async def _get_category_history(
        self, user_id: uuid.UUID, today: date, months: int
    ) -> dict[str, list[float]]:
        cat_data: dict[str, list[float]] = {}
        m, y = today.month, today.year
        for _ in range(months):
            q = (
                select(Expense.category, func.sum(Expense.amount).label("total"))
                .where(
                    Expense.user_id == user_id,
                    Expense.is_deleted == False,
                    func.extract("month", Expense.expense_date) == m,
                    func.extract("year", Expense.expense_date) == y,
                )
                .group_by(Expense.category)
            )
            rows = (await self.db.execute(q)).all()
            seen = {r.category for r in rows}
            for r in rows:
                cat_data.setdefault(r.category, []).append(float(r.total))
            # pad missing months with 0
            for cat in list(cat_data.keys()):
                if cat not in seen:
                    cat_data[cat].append(0.0)
            m -= 1
            if m == 0:
                m = 12
                y -= 1
        # reverse so oldest→newest
        for k in cat_data:
            cat_data[k] = list(reversed(cat_data[k]))
        return cat_data

    async def _get_recent_expenses(self, user_id: uuid.UUID, limit: int) -> list:
        q = (
            select(Expense)
            .where(Expense.user_id == user_id, Expense.is_deleted == False)
            .order_by(desc(Expense.expense_date), desc(Expense.created_at))
            .limit(limit)
        )
        return list((await self.db.execute(q)).scalars().all())

    def _forecast_next_month(
        self, monthly_totals: dict[tuple[int, int], float], nm: int, ny: int
    ) -> MonthForecast:
        values = list(reversed(list(monthly_totals.values())))  # oldest→newest
        non_zero = [v for v in values if v > 0]

        if len(non_zero) >= 2:
            xs = list(range(len(values)))
            slope, intercept, r2 = _linear_regression(xs, values)
            predicted = max(0.0, slope * len(values) + intercept)
            confidence = round(r2, 2)
        elif non_zero:
            predicted = non_zero[-1]  # last known
            confidence = 0.3
        else:
            predicted = 0.0
            confidence = 0.0

        std = statistics.stdev(non_zero) if len(non_zero) >= 2 else predicted * 0.1
        lower = max(0.0, predicted - std)
        upper = predicted + std

        return MonthForecast(
            month=nm,
            year=ny,
            label=f"{MONTH_LABELS[nm - 1]} '{str(ny)[2:]}",
            predicted_total=round(predicted, 2),
            lower_bound=round(lower, 2),
            upper_bound=round(upper, 2),
            confidence=confidence,
        )

    def _predict_categories(
        self, history: dict[str, list[float]], nm: int, ny: int
    ) -> list[CategoryPrediction]:
        preds = []
        for cat, vals in history.items():
            non_zero = [v for v in vals if v > 0]
            if not non_zero:
                continue
            avg3 = sum(non_zero[-3:]) / len(non_zero[-3:]) if non_zero else 0

            if len(vals) >= 2:
                xs = list(range(len(vals)))
                slope, intercept, _ = _linear_regression(xs, vals)
                predicted = max(0.0, slope * len(vals) + intercept)
            else:
                predicted = non_zero[-1] if non_zero else 0

            if avg3 > 0:
                trend_pct = ((predicted - avg3) / avg3) * 100
            else:
                trend_pct = 0.0

            if trend_pct > 5:
                trend = "up"
            elif trend_pct < -5:
                trend = "down"
            else:
                trend = "stable"

            preds.append(CategoryPrediction(
                category=cat,
                emoji=CATEGORY_EMOJI.get(cat, "💰"),
                predicted_amount=round(predicted, 2),
                avg_last_3_months=round(avg3, 2),
                trend=trend,
                trend_pct=round(trend_pct, 1),
            ))

        return sorted(preds, key=lambda p: p.predicted_amount, reverse=True)

    def _detect_anomalies(self, expenses: list) -> list[AnomalyItem]:
        # Build per-category stats from recent expenses
        cat_amounts: dict[str, list[float]] = {}
        for e in expenses:
            cat_amounts.setdefault(e.category, []).append(float(e.amount))

        anomalies = []
        for e in expenses[:20]:  # only check most recent 20
            amounts = cat_amounts.get(e.category, [])
            if len(amounts) < MIN_SAMPLES_FOR_ANOMALY:
                continue
            mean = sum(amounts) / len(amounts)
            std = statistics.stdev(amounts) if len(amounts) >= 2 else 0
            if std == 0:
                continue
            z = (float(e.amount) - mean) / std
            if z >= ANOMALY_THRESHOLD:
                dev_pct = ((float(e.amount) - mean) / mean) * 100
                anomalies.append(AnomalyItem(
                    expense_id=str(e.id),
                    category=e.category,
                    emoji=CATEGORY_EMOJI.get(e.category, "💰"),
                    amount=float(e.amount),
                    category_avg=round(mean, 2),
                    deviation_pct=round(dev_pct, 1),
                    merchant=e.merchant,
                    date=e.expense_date.isoformat(),
                ))

        return anomalies[:5]

    def _recommend_budget(
        self, monthly_totals: dict, cat_preds: list[CategoryPrediction]
    ) -> BudgetRecommendation:
        values = [v for v in monthly_totals.values() if v > 0]
        if not values:
            return BudgetRecommendation(
                recommended_limit=5000.0,
                based_on_months=0,
                median_spending=0.0,
                safety_buffer_pct=15.0,
                category_limits={},
            )

        median = statistics.median(values)
        buffer = 0.15
        recommended = round(median * (1 + buffer), -2)  # round to nearest 100

        # Per-category limits: predicted + 10% buffer
        cat_limits = {
            p.category: round(p.predicted_amount * 1.10, -1)
            for p in cat_preds
            if p.predicted_amount > 0
        }

        return BudgetRecommendation(
            recommended_limit=recommended,
            based_on_months=len(values),
            median_spending=round(median, 2),
            safety_buffer_pct=buffer * 100,
            category_limits=cat_limits,
        )

    async def _get_historical_accuracy(
        self, user_id: uuid.UUID, today: date
    ) -> float | None:
        pm = today.month - 1 if today.month > 1 else 12
        py = today.year if today.month > 1 else today.year - 1

        pred_q = select(Prediction).where(
            Prediction.user_id == user_id,
            Prediction.month == today.month,
            Prediction.year == today.year,
            Prediction.actual_total != None,
        ).order_by(desc(Prediction.generated_at)).limit(1)
        pred = (await self.db.execute(pred_q)).scalar_one_or_none()
        if not pred or not pred.actual_total:
            return None
        error_pct = abs(float(pred.predicted_total) - float(pred.actual_total)) / float(pred.actual_total) * 100
        return round(100 - error_pct, 1)

    async def _save_prediction(
        self,
        user_id: uuid.UUID,
        month: int,
        year: int,
        forecast: MonthForecast,
        cat_preds: list[CategoryPrediction],
    ) -> None:
        existing_q = select(Prediction).where(
            Prediction.user_id == user_id,
            Prediction.month == month,
            Prediction.year == year,
        )
        existing = (await self.db.execute(existing_q)).scalar_one_or_none()

        cat_dict = {p.category: p.predicted_amount for p in cat_preds}

        if existing:
            existing.predicted_total = Decimal(str(forecast.predicted_total))
            existing.predicted_by_category = cat_dict
            existing.confidence_score = Decimal(str(forecast.confidence))
            existing.model_used = "linear_regression"
        else:
            pred = Prediction(
                user_id=user_id,
                month=month,
                year=year,
                predicted_total=Decimal(str(forecast.predicted_total)),
                predicted_by_category=cat_dict,
                confidence_score=Decimal(str(forecast.confidence)),
                model_used="linear_regression",
            )
            self.db.add(pred)

        await self.db.commit()
