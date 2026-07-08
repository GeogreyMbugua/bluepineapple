import type { ReactNode } from 'react';

interface LoadingOverlayProps {
  readonly isLoading: boolean;
  readonly children: ReactNode;
  readonly message?: string;
}

export function LoadingOverlay({ isLoading, children, message }: LoadingOverlayProps) {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-50">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/50">
        <div className="flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 12h4z" />
          </svg>
          {message && <span>{message}</span>}
        </div>
      </div>
    </div>
  );
}