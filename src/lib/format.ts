/**
 * Shared formatting utilities for consistent number/currency display
 * Replaces repeated Intl.NumberFormat instantiations across the codebase
 */

const brlFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const brlCompactFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' })

/**
 * Format a number as Brazilian Real currency (e.g., R$ 1.234,56)
 */
export function formatBRL(value: number): string {
  return brlFormatter.format(value)
}

/**
 * Format a number as compact Brazilian Real currency (e.g., R$ 1,2k)
 */
export function formatBRLCompact(value: number): string {
  return brlCompactFormatter.format(value)
}

/**
 * Format a number with Brazilian locale grouping (e.g., 1.234)
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

/**
 * Format a decimal as percentage (e.g., 0.85 → 85%)
 */
export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

/**
 * Format distance in km, showing meters for sub-1km values
 */
export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`
}
