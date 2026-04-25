'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { getErrorMessage } from '@/types/api'
import type { AuthResponse } from '@/types/user'

export function useAuth() {
  const router = useRouter()
  const { setAuth, clearAuth, isAuthenticated, user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
      setAuth(data.user, data.access_token, data.refresh_token)
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`)
      router.push(data.user.onboarding_done ? '/dashboard' : '/onboarding')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: {
    name: string
    email: string
    password: string
    college?: string
    city?: string
  }) => {
    setIsLoading(true)
    try {
      const { data: res } = await api.post<AuthResponse>('/auth/register', data)
      setAuth(res.user, res.access_token, res.refresh_token)
      toast.success('Account created! Welcome to SpendWise AI.')
      router.push('/onboarding')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignore errors — always clear locally
    } finally {
      clearAuth()
      router.push('/login')
      setIsLoading(false)
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  }
}
