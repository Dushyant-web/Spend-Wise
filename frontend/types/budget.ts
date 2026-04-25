export interface CategorySpending {
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface Budget {
  id: string;
  user_id: string;
  month: number;
  year: number;
  monthly_limit: string;
  category_limits: Record<string, number>;
  rollover_enabled: boolean;
  savings_goal: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetWithSpending extends Budget {
  spending_so_far: string;
  remaining_budget: string;
  percentage_used: number;
  daily_average: number;
  days_elapsed: number;
  days_in_month: number;
  category_spending: CategorySpending[];
}

export interface BudgetHistoryItem extends Budget {
  actual_spending: number;
  percentage_used: number;
}

export interface BudgetCreate {
  monthly_limit: number;
  category_limits?: Record<string, number>;
  savings_goal?: number;
  rollover_enabled?: boolean;
}

export interface BudgetUpdate {
  monthly_limit?: number;
  category_limits?: Record<string, number>;
  savings_goal?: number;
  rollover_enabled?: boolean;
}
