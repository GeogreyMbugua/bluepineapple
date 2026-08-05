'use client';

import { useState, useEffect, useCallback } from 'react';
import { BookingsTableContent } from '@/components/admin/bookings/bookings-table-content';
import type { BookingRow } from '@/components/admin/types';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBookings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/bookings', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setBookings(json.data?.bookings || []);
      }
    } catch {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      await loadBookings();
      if (cancelled) {
        setIsLoading(false);
      }
    }

    void init();
    return () => { cancelled = true; };
  }, [loadBookings]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark">Bookings</h1>
        <p className="text-dark-6 mt-1">View and manage bookings</p>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <BookingsTableContent bookings={bookings} onUpdate={loadBookings} />
      )}
    </div>
  );
}
