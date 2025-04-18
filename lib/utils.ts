import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, differenceInDays } from "date-fns"
import { zhCN } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date to locale string
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return format(date, "yyyy年MM月dd日", { locale: zhCN })
}

// Calculate days until expiry
export function getDaysUntilExpiry(expiryDateString: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const expiryDate = new Date(expiryDateString)
  expiryDate.setHours(0, 0, 0, 0)

  const diffTime = expiryDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Get expiry status: normal, warning, expired
export function getExpiryStatus(expiryDateString: string): "normal" | "warning" | "expired" {
  const daysUntil = getDaysUntilExpiry(expiryDateString)

  if (daysUntil < 0) {
    return "expired"
  } else if (daysUntil <= 7) {
    return "warning"
  } else {
    return "normal"
  }
}

// Calculate shelf life in days between purchase date and expiry date
export function calculateShelfLife(purchaseDateString: string, expiryDateString: string): number {
  const purchaseDate = new Date(purchaseDateString)
  const expiryDate = new Date(expiryDateString)

  return differenceInDays(expiryDate, purchaseDate)
}
