// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
 return new Intl.NumberFormat('es-ES', {
   style: 'currency',
   currency: 'USD',
   minimumFractionDigits: price > 1 ? 2 : 6,
   maximumFractionDigits: price > 1 ? 2 : 6,
 }).format(price)
}

export function formatPercentage(percentage: number): string {
 return new Intl.NumberFormat('es-ES', {
   style: 'percent',
   minimumFractionDigits: 2,
   maximumFractionDigits: 2,
   signDisplay: 'always'
 }).format(percentage / 100)
}

export function formatMarketCap(marketCap: number): string {
 if (marketCap >= 1e12) {
   return `$${(marketCap / 1e12).toFixed(1)}T`
 } else if (marketCap >= 1e9) {
   return `$${(marketCap / 1e9).toFixed(1)}B`
 } else if (marketCap >= 1e6) {
   return `$${(marketCap / 1e6).toFixed(1)}M`
 } else {
   return `$${marketCap.toLocaleString()}`
 }
}

export function formatTimeAgo(date: string | Date): string {
 const now = new Date()
 const then = new Date(date)
 const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

 if (diffInSeconds < 60) {
   return 'hace unos segundos'
 } else if (diffInSeconds < 3600) {
   const minutes = Math.floor(diffInSeconds / 60)
   return `hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`
 } else if (diffInSeconds < 86400) {
   const hours = Math.floor(diffInSeconds / 3600)
   return `hace ${hours} hora${hours !== 1 ? 's' : ''}`
 } else {
   const days = Math.floor(diffInSeconds / 86400)
   return `hace ${days} día${days !== 1 ? 's' : ''}`
 }
}

export function generateId(): string {
 return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function debounce<T extends (...args: unknown[]) => void>(
 func: T,
 delay: number
): (...args: Parameters<T>) => void {
 let timeoutId: NodeJS.Timeout

 return (...args: Parameters<T>) => {
   clearTimeout(timeoutId)
   timeoutId = setTimeout(() => func(...args), delay)
 }
}

export function throttle<T extends (...args: unknown[]) => void>(
 func: T,
 delay: number
): (...args: Parameters<T>) => void {
 let lastCall = 0

 return (...args: Parameters<T>) => {
   const now = Date.now()
   if (now - lastCall >= delay) {
     lastCall = now
     func(...args)
   }
 }
}

export function validateEmail(email: string): boolean {
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 return emailRegex.test(email)
}

export function calculateReturn(currentValue: number, initialValue: number): {
 absolute: number
 percentage: number
} {
 const absolute = currentValue - initialValue
 const percentage = initialValue > 0 ? (absolute / initialValue) * 100 : 0

 return { absolute, percentage }
}

export function truncateAddress(address: string, start = 6, end = 4): string {
 if (address.length <= start + end) return address
 return `${address.slice(0, start)}...${address.slice(-end)}`
}