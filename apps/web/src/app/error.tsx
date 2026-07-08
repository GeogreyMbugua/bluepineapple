'use client';

import { useEffect } from 'react';
import type { ErrorProps } from '@/types/layout';

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled runtime error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background text-foreground">
      <div className="w-full max-w-md space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-error/10 text-error">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
        <p className="text-muted-foreground text-sm text-pretty">
          An unexpected error occurred in the application. If this issue persists, please contact support.
        </p>
        <div className="pt-2">
          <button
            onClick={reset}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600 transition-colors shadow-sm"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
