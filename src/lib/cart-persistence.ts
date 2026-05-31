/**
 * Cart Persistence Utilities for DomPlace
 * Manages cart state in localStorage so items survive page refreshes.
 */

import type { CartItemData } from '@/store/useAppStore'

const CART_STORAGE_KEY = 'domplace-cart'
const CART_TIMESTAMP_KEY = 'domplace-cart-timestamp'

/**
 * Serialized cart item format for localStorage
 * (strips the nested ProductData to keep storage lean)
 */
interface SerializedCartItem {
  id: string
  productId: string
  product: CartItemData['product']
  storeId: string
  storeName: string
  quantity: number
}

/**
 * Save cart items to localStorage with a timestamp.
 * Errors are silently caught to avoid breaking the UI.
 */
export function saveCartToStorage(items: CartItemData[]): void {
  if (typeof window === 'undefined') return
  try {
    const serialized: SerializedCartItem[] = items.map(item => ({
      id: item.id,
      productId: item.productId,
      product: item.product,
      storeId: item.storeId,
      storeName: item.storeName,
      quantity: item.quantity,
    }))
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(serialized))
    localStorage.setItem(CART_TIMESTAMP_KEY, Date.now().toString())
  } catch {
    // localStorage may be full or unavailable - silently fail
  }
}

/**
 * Load cart items from localStorage.
 * Returns null if no cart is stored or if data is corrupted.
 */
export function loadCartFromStorage(): CartItemData[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as unknown

    if (!Array.isArray(parsed)) return null

    // Validate each item has the minimum required fields
    const valid = parsed.every(
      (item: unknown) =>
        item !== null &&
        typeof item === 'object' &&
        'productId' in (item as object) &&
        'product' in (item as object) &&
        'storeId' in (item as object) &&
        'storeName' in (item as object) &&
        'quantity' in (item as object) &&
        typeof (item as Record<string, unknown>).quantity === 'number' &&
        (item as Record<string, unknown>).quantity > 0
    )

    if (!valid) return null

    return parsed as CartItemData[]
  } catch {
    // Corrupted data - clear it
    clearCartStorage()
    return null
  }
}

/**
 * Clear cart data from localStorage.
 */
export function clearCartStorage(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(CART_STORAGE_KEY)
    localStorage.removeItem(CART_TIMESTAMP_KEY)
  } catch {
    // Ignore errors
  }
}

/**
 * Get the timestamp when the cart was last saved.
 * Returns null if no timestamp exists.
 */
export function getCartTimestamp(): number | null {
  if (typeof window === 'undefined') return null
  try {
    const ts = localStorage.getItem(CART_TIMESTAMP_KEY)
    return ts ? parseInt(ts, 10) : null
  } catch {
    return null
  }
}

/**
 * Check if the stored cart is "stale" (older than a given duration).
 * Default staleness threshold: 7 days.
 */
export function isCartStale(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): boolean {
  const ts = getCartTimestamp()
  if (ts === null) return true
  return Date.now() - ts > maxAgeMs
}
