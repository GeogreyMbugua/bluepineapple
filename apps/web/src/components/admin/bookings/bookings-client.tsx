'use client';

import { useState, useCallback, useTransition } from 'react';
import { BookingsTableContent } from '@/components/admin/bookings/bookings-table-content';
import type { BookingRow } from '@/components/admin/types';

const STATUS_FILTERS = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
] as const;

type BookingStatus = typeof STATUS_FILTERS[number]['value'];

interface BookingsClientProps {
  initialBookings: BookingRow[];
}

export function BookingsClient({ initialBookings }: BookingsClientProps) {
  const [bookings, setBookings] = useState<BookingRow[]>(initialBookings);
  const [activeStatus, setActiveStatus] = useState<BookingStatus>('PENDING');
  const [isPending, startTransition] = useTransition();

  const loadBookings = useCallback(async (status: BookingStatus) => {
    try {
      const params = new URLSearchParams({ status, limit: '50' });
      const res = await fetch(`/api/admin/bookings?${params}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setBookings(json.data?.bookings ?? []);
      }
    } catch (err) {
      console.error('[BookingsClient] Failed to reload bookings:', err);
    }
  }, []);

  const handleStatusChange = (status: BookingStatus) => {
    setActiveStatus(status);
    startTransition(() => {
      void loadBookings(status);
    });
  };

  const handleRefresh = useCallback(() => {
    startTransition(() => {
      void loadBookings(activeStatus);
    });
  }, [activeStatus, loadBookings]);

  return (
    <div className="space-y-4">
      {/* Status Filter Tabs */}
      <div className="flex gap-2">
        {STATUS_FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => handleStatusChange(value)}
            disabled={isPending}
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
        {isPending && (
          <span className="self-center ml-2 text-sm text-dark-5">Loading…</span>
        )}
      </div>

      <BookingsTableContent
        bookings={bookings}
        onUpdate={handleRefresh}
      />
    </div>
  );
}
