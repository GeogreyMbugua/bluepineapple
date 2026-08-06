'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/data-table';
import type { ColumnDef } from '@/components/admin/types';

interface Props {
  userId: string;
}

interface PartnerBooking {
  id: string;
  bookingReference: string;
  experience: string;
  status: string;
  paymentStatus: string;
  totalAmount: string;
  totalGuests: number;
  createdAt: string;
}

export function PartnerBookingsTable({ userId }: Props) {
  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/partner/bookings', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          setBookings(json.data ?? []);
        }
      } catch {
        // Handle error silently
      } finally {
        setIsLoading(false);
      }
    })();
  }, [userId]);

  const columns: ColumnDef<PartnerBooking>[] = [
    { key: 'bookingReference', header: 'Reference', sortable: true },
    { key: 'experience', header: 'Experience', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'paymentStatus', header: 'Payment', sortable: true },
    { key: 'totalGuests', header: 'Guests', sortable: true },
    {
      key: 'totalAmount',
      header: 'Amount',
      sortable: true,
      cell: (row) => `KES ${Number(row.totalAmount).toLocaleString()}`,
    },
    {
      key: 'createdAt',
      header: 'Date',
      sortable: true,
      cell: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 w-full animate-pulse rounded border border-stroke bg-gray-100" />
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="px-6 py-8 text-center text-dark-5">
        No bookings yet. Create your first booking to see it here.
      </div>
    );
  }

  return <DataTable data={bookings} columns={columns} pageSize={10} />;
}
