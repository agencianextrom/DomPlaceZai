/**
 * Shopping Lists Persistence Utilities for DomPlace
 * Manages shopping lists state in localStorage so they survive page refreshes.
 */

const LISTS_STORAGE_KEY = 'domplace-shopping-lists'
const LISTS_TIMESTAMP_KEY = 'domplace-shopping-lists-timestamp'

export interface ShoppingItem {
  id: string
  name: string
  quantity: number
  price: number
  checked: boolean
}

export interface ShoppingList {
  id: string
  name: string
  iconName: string // serialized icon name (e.g., 'ListChecks', 'Flame')
  items: ShoppingItem[]
  lastModified: string
  color: string
  iconBg: string
}

/**
 * Save shopping lists to localStorage with a timestamp.
 */
export function saveListsToStorage(lists: ShoppingList[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(lists))
    localStorage.setItem(LISTS_TIMESTAMP_KEY, Date.now().toString())
  } catch {
    // localStorage may be full or unavailable — silently fail
  }
}

/**
 * Load shopping lists from localStorage.
 * Returns null if no data is stored or data is corrupted.
 */
export function loadListsFromStorage(): ShoppingList[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LISTS_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as unknown

    if (!Array.isArray(parsed)) return null

    const valid = parsed.every(
      (item: unknown) =>
        item !== null &&
        typeof item === 'object' &&
        'id' in (item as object) &&
        'name' in (item as object) &&
        'items' in (item as object) &&
        Array.isArray((item as Record<string, unknown>).items)
    )

    if (!valid) return null

    return parsed as ShoppingList[]
  } catch {
    clearListsStorage()
    return null
  }
}

/**
 * Clear shopping lists data from localStorage.
 */
export function clearListsStorage(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(LISTS_STORAGE_KEY)
    localStorage.removeItem(LISTS_TIMESTAMP_KEY)
  } catch {
    // Ignore errors
  }
}
