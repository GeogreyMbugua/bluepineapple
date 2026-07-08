'use client';

import { useSyncExternalStore } from 'react';
import { MOBILE_BREAKPOINT } from '@/config/constants';

/**
 * Detect if the viewport is at or below the mobile breakpoint.
 *
 * Uses `useSyncExternalStore` for clean, event-driven detection
 * that integrates with React 19 features.
 */
export function useMobile(breakpoint: number = MOBILE_BREAKPOINT): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
      mql.addEventListener('change', callback);
      return () => mql.removeEventListener('change', callback);
    },
    () => window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches,
    () => false // Server-side / hydration fallback
  );
}
