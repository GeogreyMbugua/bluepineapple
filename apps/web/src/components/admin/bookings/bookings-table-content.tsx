'use client';

import { useState } from 'react';
import { DataTable } from '@/components/admin/data-table';
import type { ColumnDef } from '@/components/admin/types';
import type { BookingRow } from '@/components/admin/types';
import { useToast } from '@/providers/toast-provider';

interface BookingsTableContentProps {
  bookings: BookingRow[];
  onUpdate?: () => void;
}

export function BookingsTableContent({ bookings, onUpdate }: BookingsTableContentProps) {
  const { addToast } = useToast();
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const handleConfirm = async (id: string) => {
    setLoadingIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/admin/bookings/${id}/confirm`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed to confirm booking');
      }

      addToast('Booking confirmed successfully', 'success');
      onUpdate?.();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to confirm booking', 'error');
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleCancel = async (id: string) => {
    const reason = prompt('Enter cancellation reason (optional):');
    if (reason === null) return;

    setLoadingIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/admin/bookings/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || null }),
        credentials: 'include',
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed to cancel booking');
      }

      addToast('Booking cancelled successfully', 'success');
      onUpdate?.();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to cancel booking', 'error');
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const columns: ColumnDef<BookingRow>[] = [
    { key: 'bookingReference', header: 'Reference', sortable: true },
    { key: 'experience', header: 'Experience', sortable: true },
    { key: 'partner', header: 'Partner', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'paymentStatus', header: 'Payment', sortable: true },
    { key: 'amount', header: 'Amount', sortable: true },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row) => {
        if (row.status === 'PENDING') {
          const isLoading = loadingIds.has(row.id);
          return (
            <div className="flex gap-2">
              <button
                onClick={() => handleConfirm(row.id)}
                disabled={isLoading}
                className="px-3 py-1 text-xs font-medium text-white bg-green hover:bg-green-dark rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Confirming...' : 'Confirm'}
              </button>
              <button
                onClick={() => handleCancel(row.id)}
                disabled={isLoading}
                className="px-3 py-1 text-xs font-medium text-white bg-red hover:bg-red-dark rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Cancelling...' : 'Cancel'}
              </button>
            </div>
          );
        }
        return <span className="text-xs text-dark-5">—</span>;
      },
    },
  ];

  return <DataTable data={bookings} columns={columns} pageSize={10} />;
}
