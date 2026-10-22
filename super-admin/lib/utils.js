import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatNumber(num) {
  if (num === undefined || num === null) return '0'
  return new Intl.NumberFormat('en-IN').format(num)
}

export function getCustomerMenuBaseUrl() {
  if (process.env.NEXT_PUBLIC_CUSTOMER_URL) {
    return process.env.NEXT_PUBLIC_CUSTOMER_URL.replace(/\/+$/, '')
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:3003'
  }
  return 'https://customermenu.scanzaa.in'
}
