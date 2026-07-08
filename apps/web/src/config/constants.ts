/**
 * Application-wide constants.
 *
 * Centralizes magic values that would otherwise be scattered across the codebase.
 */

export const APP_NAME = 'Blue Pineapple' as const;
export const APP_SHORT_NAME = 'BP' as const;

/** Default locale for Intl formatters */
export const DEFAULT_LOCALE = 'en-US' as const;

/** Default currency */
export const DEFAULT_CURRENCY = 'USD' as const;

/** Pagination defaults */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/** Date format tokens for Intl.DateTimeFormat */
export const DATE_FORMATS = {
  SHORT: { year: 'numeric', month: 'short', day: 'numeric' } as const,
  LONG: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  } as const,
  TIME: { hour: '2-digit', minute: '2-digit' } as const,
  DATETIME: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  } as const,
} as const;

/** Debounce delay in milliseconds */
export const DEBOUNCE_MS = 300 as const;

/** Mobile breakpoint in pixels */
export const MOBILE_BREAKPOINT = 768 as const;
