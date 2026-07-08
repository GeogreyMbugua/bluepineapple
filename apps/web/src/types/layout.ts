/**
 * Layout types for the App Router.
 */

import type { ReactNode } from 'react';

/** Standard layout props (App Router convention) */
export interface LayoutProps {
  readonly children: ReactNode;
}

/** Standard page props with typed params and searchParams (Next.js 16) */
export interface PageProps<
  TParams extends Record<string, string> = Record<string, string>,
  TSearchParams extends Record<string, string | readonly string[] | undefined> = Record<
    string,
    string | readonly string[] | undefined
  >,
> {
  readonly params: Promise<TParams>;
  readonly searchParams: Promise<TSearchParams>;
}

/** Error boundary props (App Router convention) */
export interface ErrorProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}
