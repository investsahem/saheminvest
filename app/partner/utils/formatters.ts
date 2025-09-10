/**
 * Utility functions for formatting numbers, percentages, and currency in partner dashboard
 */

/**
 * Format percentage with proper rounding to avoid floating point precision issues
 * @param numerator - The numerator value
 * @param denominator - The denominator value  
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string without % symbol
 */
export function formatPercentage(numerator: number, denominator: number, decimals: number = 1): string {
  if (denominator === 0) return '0'
  
  const percentage = (numerator / denominator) * 100
  return percentage.toFixed(decimals)
}

/**
 * Format a raw percentage value with proper rounding
 * @param percentage - Raw percentage value (e.g., 66.66666666666666)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string without % symbol
 */
export function formatRawPercentage(percentage: number, decimals: number = 1): string {
  return percentage.toFixed(decimals)
}

/**
 * Format currency values
 * @param value - Numeric value to format
 * @param currency - Currency code (default: 'USD')
 * @param minimumFractionDigits - Minimum decimal places (default: 0)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency: string = 'USD', minimumFractionDigits: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits
  }).format(value)
}

/**
 * Format large numbers with K, M, B suffixes
 * @param value - Numeric value to format
 * @returns Formatted number string with suffix
 */
export function formatLargeNumber(value: number): string {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(1) + 'B'
  } else if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K'
  }
  return value.toString()
}

/**
 * Format regular numbers with thousand separators
 * @param value - Numeric value to format
 * @returns Formatted number string
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

/**
 * Safe division that handles zero denominators
 * @param numerator - The numerator value
 * @param denominator - The denominator value
 * @returns Division result or 0 if denominator is 0
 */
export function safeDivide(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator
}
