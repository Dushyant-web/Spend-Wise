import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '@/types/user'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean

  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  updateUser: (updates: Partial<User>) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        // Also set a cookie so Next.js middleware can read it
        if (typeof document !== 'undefined') {
          document.cookie = `sw_access_token=${accessToken}; path=/; max-age=${30 * 60}; SameSite=Strict`
        }
        set({ user, accessToken, refreshToken, isAuthenticated: true })
      },

      setTokens: (accessToken, refreshToken) => {
        if (typeof document !== 'undefined') {
          document.cookie = `sw_access_token=${accessToken}; path=/; max-age=${30 * 60}; SameSite=Strict`
        }
        set({ accessToken, refreshToken })
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      clearAuth: () => {
        if (typeof document !== 'undefined') {
          document.cookie = 'sw_access_token=; path=/; max-age=0'
        }
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
      },
    }),
    {
      name: 'sw-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
