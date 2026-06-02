/**
 * Delivery time estimation utilities for DomPlace
 * Calculates reasonable delivery estimates based on store hours or defaults.
 */

import type { StoreData } from '@/store/useAppStore'

/**
 * Default delivery time ranges for Dom Eliseu (small town).
 * Used when no store-specific data is available.
 */
const DEFAULT_DELIVERY_RANGES: Record<string, { min: number; max: number }> = {
  FOOD: { min: 20, max: 35 },
  HEALTH: { min: 30, max: 45 },
  AGRICULTURE: { min: 40, max: 60 },
  BEAUTY: { min: 25, max: 40 },
  SERVICES: { min: 20, max: 35 },
  DEFAULT: { min: 25, max: 45 },
}

/**
 * Check if a store is currently open based on its opensAt/closesAt and openDays.
 * Returns true if open, false if closed, null if unknown.
 */
export function isStoreOpen(store?: Pick<StoreData, 'opensAt' | 'closesAt' | 'openDays'> | null): boolean | null {
  if (!store?.opensAt || !store?.closesAt) return null

  const now = new Date()
  const currentDay = now.getDay() // 0=Sun, 6=Sat
  const currentTime = now.getHours() * 60 + now.getMinutes()

  // Parse open days string (e.g., "1,2,3,4,5" for Mon-Fri)
  const openDays = store.openDays
    .split(',')
    .map(d => parseInt(d.trim(), 10))
    .filter(d => !isNaN(d))

  if (!openDays.includes(currentDay)) return false

  // Parse opensAt/closesAt (e.g., "08:00", "21:00")
  const [openH, openM] = store.opensAt.split(':').map(Number)
  const [closeH, closeM] = store.closesAt.split(':').map(Number)

  const openMinutes = openH * 60 + openM
  const closeMinutes = closeH * 60 + closeM

  return currentTime >= openMinutes && currentTime <= closeMinutes
}

/**
 * Calculate a delivery time estimate string for a store.
 * If store hours are available, adjusts estimate based on whether store is open.
 * Otherwise returns a reasonable default for the given category.
 */
export function getDeliveryEstimate(
  store?: Pick<StoreData, 'opensAt' | 'closesAt' | 'openDays' | 'category'> | null,
  category?: string
): string {
  const open = isStoreOpen(store)
  const range = DEFAULT_DELIVERY_RANGES[category || store?.category || ''] || DEFAULT_DELIVERY_RANGES.DEFAULT

  if (open === false) {
    // Store is closed — add buffer for next-day pickup
    return `${range.min + 15}-${range.max + 30} min`
  }

  if (open === true) {
    // Store is open — normal delivery
    return `${range.min}-${range.max} min`
  }

  // Unknown hours — default estimate
  return `${range.min}-${range.max} min`
}

/**
 * Calculate a delivery time estimate in minutes (single number, upper bound).
 * Useful for components that need a numeric value.
 */
export function getDeliveryMinutes(
  store?: Pick<StoreData, 'opensAt' | 'closesAt' | 'openDays' | 'category'> | null,
  category?: string
): number {
  const open = isStoreOpen(store)
  const range = DEFAULT_DELIVERY_RANGES[category || store?.category || ''] || DEFAULT_DELIVERY_RANGES.DEFAULT

  if (open === false) return range.max + 30
  return range.max
}
