'use client';

import { DataTable } from '@/components/admin/data-table';
import type { ColumnDef } from '@/components/admin/types';

interface PartnerBooking {
  id: string;
  bookingReference: string;
  experience: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  totalGuests: number;
  createdAt: string;
}

interface Props {
  bookings: PartnerBooking[];
}

export function PartnerBookingsTable({ bookings }: Props) {
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

  if (bookings.length === 0) {
    return (
      <div className="px-6 py-8 text-center text-dark-5">
        No bookings yet. Create your first booking to see it here.
      </div>
    );
  }

  return <DataTable data={bookings} columns={columns} pageSize={10} />;
}
