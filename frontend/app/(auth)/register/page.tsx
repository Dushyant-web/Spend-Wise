'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, Zap } from 'lucide-react'
import { registerSchema, type RegisterInput } from '@/lib/validations'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const colors = ['bg-[#FF6B6B]', 'bg-[#FFB347]', 'bg-[#FFB347]', 'bg-[#00D4AA]']
  const labels = ['Weak', 'Fair', 'Good', 'Strong']

  if (!password) return null

  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < score ? colors[score - 1] : 'bg-white/[0.08]'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs ${score >= 3 ? 'text-[#00D4AA]' : 'text-[#9CA3AF]'}`}>
        {labels[score - 1] ?? 'Enter a password'}
      </p>
    </div>
  )
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const { register: registerUser, isLoading } = useAuth()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  const password = watch('password', '')

  const onSubmit = async (data: RegisterInput) => {
    await registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
      college: data.college || undefined,
      city: data.city || undefined,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-[480px]"
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
          <h1 className="text-2xl font-semibold text-[#F0F0FF]">Create your account</h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            Start tracking smarter. Free forever.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Rahul Sharma"
              autoComplete="name"
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-[#FF6B6B]">{errors.name.message}</p>}
          </div>

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
            {errors.email && <p className="text-xs text-[#FF6B6B]">{errors.email.message}</p>}
          </div>

          {/* College + City */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="college">College <span className="text-[#6B7280]">(optional)</span></Label>
              <Input id="college" placeholder="IIT Delhi" {...register('college')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City <span className="text-[#6B7280]">(optional)</span></Label>
              <Input id="city" placeholder="Delhi" {...register('city')} />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters with a number"
                autoComplete="new-password"
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
            <PasswordStrength password={password} />
            {errors.password && (
              <p className="text-xs text-[#FF6B6B]">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                className="pr-11"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-[#FF6B6B]">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Terms & Privacy */}
          <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#6C63FF]"
            />
            <span className="text-xs leading-relaxed text-[#9CA3AF]">
              I agree to the{' '}
              <Link href="/terms" className="text-[#A78BFA] hover:text-[#C4B5FD] underline-offset-2 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[#A78BFA] hover:text-[#C4B5FD] underline-offset-2 hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          {/* Submit */}
          <Button type="submit" className="w-full mt-1" size="lg" disabled={isLoading || !agreed}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account…
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6B7280]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#6C63FF] hover:text-[#8B5CF6] font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
