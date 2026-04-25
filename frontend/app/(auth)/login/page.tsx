'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, Zap } from 'lucide-react'
import { loginSchema, type LoginInput } from '@/lib/validations'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginInput) => {
    await login(data.email, data.password)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-[440px]"
    >
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6C63FF]">
            <Zap className="h-5 w-5 text-white" fill="white" />
          </div>
          <span className="text-xl font-bold text-[#F0F0FF]">SpendWise AI</span>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#13131A]/90 backdrop-blur-xl p-8">
        <div className="mb-7">
          <h1 className="text-2xl font-semibold text-[#F0F0FF]">Welcome back</h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">Sign in to your SpendWise account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@college.edu"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-[#FF6B6B]">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                className="pr-11"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-[#FF6B6B]">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full mt-2" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-[#6B7280]">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#6C63FF] hover:text-[#8B5CF6] font-medium transition-colors">
            Create account
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
