import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F] disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        default:
          'bg-[#6C63FF] text-white hover:bg-[#5a52e8] shadow-lg shadow-[#6C63FF]/25 active:scale-[0.98]',
        secondary:
          'bg-[#00D4AA] text-black hover:bg-[#00bfa0] shadow-lg shadow-[#00D4AA]/20',
        outline:
          'border border-white/[0.08] bg-white/[0.03] text-[#F0F0FF] hover:bg-white/[0.07] hover:border-white/[0.15]',
        ghost:
          'text-[#9CA3AF] hover:text-[#F0F0FF] hover:bg-white/[0.05]',
        destructive:
          'bg-[#FF6B6B] text-white hover:bg-[#e55f5f] shadow-lg shadow-[#FF6B6B]/20',
        link: 'text-[#6C63FF] underline-offset-4 hover:underline h-auto p-0',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 rounded-md px-4 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
