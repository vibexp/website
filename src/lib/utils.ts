import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a monetary amount for display. The amount must already be in major
 * currency units (e.g. euros), not minor units (cents) — callers holding cents
 * must divide by 100 first. Single source of truth for currency rendering on
 * the marketing site.
 *
 * Whole amounts render without trailing zeros (€12, €0) while fractional
 * amounts keep their cents (€9.99) — matching the approved pricing design.
 */
export function formatPrice(amount: number, currency: string = 'eur'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}
