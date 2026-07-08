import type { ReactNode } from 'react';

export function EmptyBookings({ action }: { readonly action?: ReactNode }) {
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
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
      <p className="mt-2 text-sm text-gray-500">
        You haven&apos;t made any bookings yet. Start exploring experiences to book your trip.
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}