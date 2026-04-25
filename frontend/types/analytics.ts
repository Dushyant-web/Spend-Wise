export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  emoji: string;
}

export interface MonthlyTrendItem {
  month: number;
  year: number;
  label: string;
  total: number;
  budget: number | null;
  count: number;
}

export interface DailySpendingItem {
  day: number;
  date: string;
  amount: number;
  cumulative: number;
}

export interface TopMerchantItem {
  merchant: string;
  amount: number;
  count: number;
  category: string;
}

export interface PaymentModeItem {
  mode: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface OverviewResponse {
  total_spent: number;
  transaction_count: number;
  avg_per_transaction: number;
  avg_per_day: number;
  top_category: string | null;
  top_category_amount: number;
  compared_to_last_month: number;
  projected_monthly: number;
  days_elapsed: number;
  days_in_month: number;
}

export interface AnalyticsResponse {
  overview: OverviewResponse;
  category_breakdown: CategoryBreakdownItem[];
  monthly_trend: MonthlyTrendItem[];
  daily_spending: DailySpendingItem[];
  top_merchants: TopMerchantItem[];
  payment_modes: PaymentModeItem[];
}
