'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from './theme-provider';
import { SessionProvider } from './session-provider';
import { QueryProvider } from './query-provider';
import { ToastProvider } from './toast-provider';

/**
 * Application provider composition root.
 *
 * Nests all providers in the correct dependency order. The root layout
 * imports only this component, keeping the layout file clean.
 *
 * Order matters:
 * 1. ThemeProvider — visual layer, no deps
 * 2. QueryProvider — data layer
 * 3. SessionProvider — depends on query layer for session fetching
 * 4. ToastProvider — notification layer, used by everything
 */
export function AppProviders({ children }: { readonly children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <SessionProvider>
          <ToastProvider>{children}</ToastProvider>
        </SessionProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
