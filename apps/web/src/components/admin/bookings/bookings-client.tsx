'use client';

import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BookingsTableContent } from '@/components/admin/bookings/bookings-table-content';
import { adminBookingsOptions } from '@/lib/queries/admin/bookings';

const STATUS_FILTERS = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
] as const;

type BookingStatus = typeof STATUS_FILTERS[number]['value'];

export function BookingsClient() {
  const [activeStatus, setActiveStatus] = useState<BookingStatus>('ALL');
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    ...adminBookingsOptions({ status: activeStatus, limit: 50 }),
    select: (data) => data,
  });

  const handleStatusChange = (status: BookingStatus) => {
    setActiveStatus(status);
  };

  const invalidateBookings = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
  }, [queryClient]);

  return (
    <div className="space-y-4">
      {/* Status Filter Tabs */}
      <div className="flex gap-2">
        {STATUS_FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => handleStatusChange(value)}
            disabled={isLoading}
            className={[
              'rounded border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60',
              activeStatus === value
                ? 'border-cyan-deep bg-primary text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-cyan hover:text-primary-deep',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
        {isLoading && (
          <span className="self-center ml-2 text-sm text-dark-5">Loading…</span>
        )}
      </div>

      <BookingsTableContent bookings={bookings} onUpdate={invalidateBookings} />
    </div>
  );
}
