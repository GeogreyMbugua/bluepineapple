/**
 * Cookie utilities.
 *
 * Client-side helpers use `document.cookie`.
 * Server-side helpers use `next/headers` cookies().
 * Import keys from this barrel to ensure typed cookie names.
 */

export { COOKIE_KEYS, type CookieKey } from './keys';
export { getCookie, setCookie, removeCookie } from './client';

// Server-only exports — import directly from '@/lib/cookies/server'
// in Server Components, Route Handlers, and Server Actions.
// Re-exporting here would pull next/headers into client bundles.
