'use client';

import type { ReactNode } from 'react';

/**
 * Query provider placeholder.
 *
 * Will wrap React Query (or SWR) when data fetching patterns mature.
 * Currently a passthrough so the provider composition is already wired.
 */
export function QueryProvider({ children }: { readonly children: ReactNode }) {
  return <>{children}</>;
}
