/**
 * Utility functions for safe decimal handling to prevent floating point precision issues
 */

/**
 * Safely converts a number or string to a decimal with proper precision
 * Prevents floating point arithmetic errors common with parseFloat()
 * @param value - The value to convert
 * @param decimals - Number of decimal places (default: 2 for currency)
 * @returns Properly rounded decimal number
 */
export function toSafeDecimal(value: string | number, decimals: number = 2): number {
  if (value === null || value === undefined || value === '') {
    return 0
  }
  
  const num = Number(value)
  
  if (isNaN(num)) {
    return 0
  }
  
  // Use Math.round with power of 10 to avoid floating point errors
  const factor = Math.pow(10, decimals)
  return Math.round(num * factor) / factor
}

/**
 * Safely converts a monetary amount (always 2 decimal places)
 * @param value - The monetary value to convert
 * @returns Properly rounded monetary amount
 */
export function toSafeMoney(value: string | number): number {
  return toSafeDecimal(value, 2)
}

/**
 * Safely adds two monetary amounts
 * @param a - First amount
 * @param b - Second amount
 * @returns Sum with proper decimal precision
 */
export function addMoney(a: number, b: number): number {
  return toSafeMoney(a + b)
}

/**
 * Safely subtracts two monetary amounts
 * @param a - First amount
 * @param b - Amount to subtract
 * @returns Difference with proper decimal precision
 */
export function subtractMoney(a: number, b: number): number {
  return toSafeMoney(a - b)
}

/**
 * Safely multiplies a monetary amount
 * @param amount - The amount
 * @param multiplier - The multiplier
 * @returns Product with proper decimal precision
 */
export function multiplyMoney(amount: number, multiplier: number): number {
  return toSafeMoney(amount * multiplier)
}

/**
 * Safely divides a monetary amount
 * @param amount - The amount
 * @param divisor - The divisor
 * @returns Quotient with proper decimal precision
 */
export function divideMoney(amount: number, divisor: number): number {
  if (divisor === 0) {
    return 0
  }
  return toSafeMoney(amount / divisor)
}

/**
 * Validates if a value is a valid monetary amount
 * @param value - The value to validate
 * @returns True if valid monetary amount
 */
export function isValidMoney(value: string | number): boolean {
  const num = Number(value)
  return !isNaN(num) && isFinite(num) && num >= 0
}

/**
 * Formats a monetary amount for display
 * @param amount - The amount to format
 * @param currency - Currency symbol (default: '$')
 * @returns Formatted currency string
 */
export function formatMoney(amount: number, currency: string = '$'): string {
  return `${currency}${toSafeMoney(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}
