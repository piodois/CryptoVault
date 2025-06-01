// src/components/ui/Badge.tsx
import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(({
  className,
  variant = 'default',
  ...props
}, ref) => {
  const variants = {
    default: 'bg-neutral-100 text-neutral-800 border-neutral-200',
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-primary-100 text-primary-800 border-primary-200'
  }

  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
        'border transition-colors duration-200',
        variants[variant],
        className
      )}
      {...props}
    />
  )
})

Badge.displayName = 'Badge'