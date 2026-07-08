/**
 * Currency formatting using Intl.NumberFormat.
 */

import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from '@/config/constants';

/**
 * Format a number as currency.
 *
 * @param amount - The numeric amount
 * @param currency - ISO 4217 currency code (defaults to USD)
 * @param locale - BCP 47 locale string (defaults to en-US)
 */
export function formatCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
