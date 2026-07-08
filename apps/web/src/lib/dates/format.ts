/**
 * Date formatting using Intl.DateTimeFormat.
 *
 * No external date library dependency — Intl is sufficient for display formatting.
 */

import { DATE_FORMATS, DEFAULT_LOCALE } from '@/config/constants';

/**
 * Format a date using the SHORT preset (e.g., "Jun 30, 2026").
 */
export function formatDateShort(date: Date | string, locale: string = DEFAULT_LOCALE): string {
  return new Intl.DateTimeFormat(locale, DATE_FORMATS.SHORT).format(new Date(date));
}

/**
 * Format a date using the LONG preset (e.g., "Tuesday, June 30, 2026").
 */
export function formatDateLong(date: Date | string, locale: string = DEFAULT_LOCALE): string {
  return new Intl.DateTimeFormat(locale, DATE_FORMATS.LONG).format(new Date(date));
}

/**
 * Format a time (e.g., "02:30 PM").
 */
export function formatTime(date: Date | string, locale: string = DEFAULT_LOCALE): string {
  return new Intl.DateTimeFormat(locale, DATE_FORMATS.TIME).format(new Date(date));
}

/**
 * Format a date and time (e.g., "Jun 30, 2026, 02:30 PM").
 */
export function formatDateTime(date: Date | string, locale: string = DEFAULT_LOCALE): string {
  return new Intl.DateTimeFormat(locale, DATE_FORMATS.DATETIME).format(new Date(date));
}

/**
 * Format a relative time (e.g., "3 hours ago", "in 2 days").
 */
export function formatRelativeTime(date: Date | string, locale: string = DEFAULT_LOCALE): string {
  const now = Date.now();
  const target = new Date(date).getTime();
  const diffMs = target - now;
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffDays) >= 1) return rtf.format(diffDays, 'day');
  if (Math.abs(diffHours) >= 1) return rtf.format(diffHours, 'hour');
  if (Math.abs(diffMinutes) >= 1) return rtf.format(diffMinutes, 'minute');
  return rtf.format(diffSeconds, 'second');
}
