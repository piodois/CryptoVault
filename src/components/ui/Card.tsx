// src/components/ui/Card.tsx
import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'dark' | 'glass'
  hover?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card({
  className,
  variant = 'default',
  hover = true,
  children,
  ...props
}, ref) {
  const variants = {
    default: 'bg-white rounded-2xl border border-gray-200 shadow-sm',
    dark: 'bg-gray-900 rounded-2xl border border-gray-800 shadow-lg',
    glass: 'bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl'
  }

  return (
    <div
      ref={ref}
      className={cn(
        variants[variant],
        hover && 'hover:shadow-md hover:scale-105 transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ className, ...props }, ref) {
    return (
      <div ref={ref} className={cn('p-6 pb-4', className)} {...props} />
    )
  }
)

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardContent({ className, ...props }, ref) {
    return (
      <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
    )
  }
)

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, ...props }, ref) {
    return (
      <div ref={ref} className={cn('p-6 pt-4', className)} {...props} />
    )
  }
)