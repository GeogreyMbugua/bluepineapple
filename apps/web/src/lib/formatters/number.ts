/**
 * Number formatting using Intl.NumberFormat.
 */

import { DEFAULT_LOCALE } from '@/config/constants';

/**
 * Format a number with locale-aware separators.
 */
export function formatNumber(
  value: number,
  locale: string = DEFAULT_LOCALE,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Format a number as a percentage.
 *
 * @param value - A decimal value (e.g., 0.15 for 15%)
 */
export function formatPercentage(
  value: number,
  locale: string = DEFAULT_LOCALE,
  minimumFractionDigits: number = 0,
  maximumFractionDigits: number = 1,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

/**
 * Format a large number in compact notation (e.g., 1.2K, 3.4M).
 */
export function formatCompact(value: number, locale: string = DEFAULT_LOCALE): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value);
}
