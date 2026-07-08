import type { ReactNode } from 'react';

export function EmptyDashboard({ action }: { readonly action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <svg
        className="mb-4 h-12 w-12 text-gray-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"
        />
      </svg>
      <h3 className="text-lg font-medium text-gray-900">Dashboard is empty</h3>
      <p className="mt-2 text-sm text-gray-500">
        No data available at the moment. Check back later or contact support.
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}