export interface AdminStatsResponse {
  total_users: number;
  active_today: number;
  active_this_week: number;
  total_expenses_logged: number;
  total_amount_tracked: number;
  new_users_this_month: number;
  top_categories: { category: string; count: number }[];
}

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  college: string | null;
  city: string | null;
  is_active: boolean;
  is_admin: boolean;
  onboarding_done: boolean;
  total_xp: number;
  current_level: number;
  expense_count: number;
  created_at: string;
  last_login_at: string | null;
}

export interface AdminUsersResponse {
  items: AdminUserItem[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}
