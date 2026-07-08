import type { ReactNode } from 'react';

export function EmptyTrips({ action }: { readonly action?: ReactNode }) {
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
          d="M12 19l9-7-9-7-9 7 9 7z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 19V5"
        />
      </svg>
      <h3 className="text-lg font-medium text-gray-900">No trips planned</h3>
      <p className="mt-2 text-sm text-gray-500">
        You haven&apos;t planned any trips yet. Start planning your next adventure.
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}