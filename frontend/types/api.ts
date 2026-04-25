export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  pages: number
}

export interface MessageResponse {
  message: string
}

export interface ApiError {
  detail: string | { msg: string; type: string; loc: string[] }[]
}

export function getErrorMessage(error: unknown): string {
  if (!error) return 'An unexpected error occurred'
  const err = error as { response?: { data?: ApiError } }
  const detail = err.response?.data?.detail
  if (!detail) return 'An unexpected error occurred'
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((d) => d.msg).join(', ')
  return 'An unexpected error occurred'
}
