export interface CategoryPrediction {
  category: string;
  emoji: string;
  predicted_amount: number;
  avg_last_3_months: number;
  trend: "up" | "down" | "stable";
  trend_pct: number;
}

export interface AnomalyItem {
  expense_id: string;
  category: string;
  emoji: string;
  amount: number;
  category_avg: number;
  deviation_pct: number;
  merchant: string | null;
  date: string;
}

export interface BudgetRecommendation {
  recommended_limit: number;
  based_on_months: number;
  median_spending: number;
  safety_buffer_pct: number;
  category_limits: Record<string, number>;
}

export interface MonthForecast {
  month: number;
  year: number;
  label: string;
  predicted_total: number;
  lower_bound: number;
  upper_bound: number;
  confidence: number;
}

export interface PredictionResponse {
  next_month_forecast: MonthForecast;
  category_predictions: CategoryPrediction[];
  anomalies: AnomalyItem[];
  budget_recommendation: BudgetRecommendation;
  historical_accuracy: number | null;
  generated_at: string;
  data_months_used: number;
}
