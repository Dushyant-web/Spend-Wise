export interface UserStats {
  total_xp: number
  current_level: number
  current_streak: number
  longest_streak: number
  last_active_date: string | null
  total_saved: string
  monthly_challenges_completed: number
  smart_spender_rank: 'bronze' | 'silver' | 'gold' | 'platinum'
}

export interface User {
  id: string
  name: string
  email: string
  avatar_url: string | null
  phone: string | null
  college: string | null
  city: string | null
  monthly_income: string
  auth_provider: 'email' | 'google'
  is_verified: boolean
  is_active: boolean
  is_admin: boolean
  onboarding_done: boolean
  last_login_at: string | null
  created_at: string
  stats: UserStats | null
}

export interface AuthResponse {
  user: User
  access_token: string
  refresh_token: string
  token_type: string
}

export interface GoogleAuthResponse extends AuthResponse {
  is_new_user: boolean
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}
