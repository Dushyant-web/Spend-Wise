export type Category =
  | "food"
  | "transport"
  | "shopping"
  | "entertainment"
  | "bills"
  | "education"
  | "rent"
  | "subscriptions"
  | "emergency"
  | "miscellaneous";

export type PaymentMode = "upi" | "cash" | "card" | "netbanking";

export type RecurringFrequency = "daily" | "weekly" | "monthly" | "yearly";

export interface Expense {
  id: string;
  user_id: string;
  amount: string;
  category: Category;
  subcategory: string | null;
  merchant: string | null;
  note: string | null;
  payment_mode: PaymentMode;
  source: string;
  tags: string[] | null;
  is_recurring: boolean;
  receipt_url: string | null;
  expense_date: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedExpenseResponse {
  items: Expense[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface ExpenseCreate {
  amount: number;
  category: Category;
  subcategory?: string;
  merchant?: string;
  note?: string;
  payment_mode?: PaymentMode;
  tags?: string[];
  expense_date?: string;
  is_recurring?: boolean;
  recurring_frequency?: RecurringFrequency;
}

export interface ExpenseUpdate {
  amount?: number;
  category?: Category;
  subcategory?: string;
  merchant?: string;
  note?: string;
  payment_mode?: PaymentMode;
  tags?: string[];
  expense_date?: string;
}

export interface ExpenseFilters {
  page?: number;
  per_page?: number;
  category?: string;
  payment_mode?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  month?: number;
  year?: number;
}
