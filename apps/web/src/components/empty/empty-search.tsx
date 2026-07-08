import type { ReactNode } from 'react';

export function EmptySearch({ action }: { readonly action?: ReactNode }) {
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
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <h3 className="text-lg font-medium text-gray-900">No results found</h3>
      <p className="mt-2 text-sm text-gray-500">
        Try adjusting your search or filters to find what you&apos;re looking for.
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}