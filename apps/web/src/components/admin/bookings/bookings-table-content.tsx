'use client';

import { useState } from 'react';
import { DataTable } from '@/components/admin/data-table';
import type { ColumnDef } from '@/components/admin/types';
import type { BookingRow } from '@/components/admin/types';
import { useToast } from '@/providers/toast-provider';
import { Modal } from '@/components/admin/ui/modal';

interface BookingsTableContentProps {
  bookings: BookingRow[];
  onUpdate?: () => void;
}

export function BookingsTableContent({ bookings, onUpdate }: BookingsTableContentProps) {
  const { addToast } = useToast();
  const [confirmingIds, setConfirmingIds] = useState<Set<string>>(new Set());
  const [cancellingIds, setCancellingIds] = useState<Set<string>>(new Set());
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const handleConfirm = async (id: string) => {
    setConfirmingIds((prev) => new Set(prev).add(id));
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
      setConfirmingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const openCancelModal = (id: string) => {
    setCancelTargetId(id);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleCancelSubmit = async () => {
    if (!cancelTargetId) return;

    setCancellingIds((prev) => new Set(prev).add(cancelTargetId));
    setCancelModalOpen(false);
    try {
      const res = await fetch(`/api/admin/bookings/${cancelTargetId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason.trim() || null }),
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
      setCancellingIds((prev) => {
        const next = new Set(prev);
        next.delete(cancelTargetId);
        return next;
      });
      setCancelTargetId(null);
      setCancelReason('');
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
          const isConfirming = confirmingIds.has(row.id);
          const isCancelling = cancellingIds.has(row.id);
          return (
            <div className="flex gap-2">
              <button
                onClick={() => handleConfirm(row.id)}
                disabled={isConfirming || isCancelling}
                className="px-3 py-1 text-xs font-medium text-white bg-green hover:bg-green-dark rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConfirming ? 'Confirming...' : 'Confirm'}
              </button>
              <button
                onClick={() => openCancelModal(row.id)}
                disabled={isConfirming || isCancelling}
                className="px-3 py-1 text-xs font-medium text-white bg-red hover:bg-red-dark rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel'}
              </button>
            </div>
          );
        }
        return <span className="text-xs text-dark-5">—</span>;
      },
    },
  ];

  return (
    <>
      <DataTable data={bookings} columns={columns} pageSize={10} />

      <Modal
        open={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setCancelTargetId(null);
          setCancelReason('');
        }}
        title="Cancel Booking"
      >
        <div className="space-y-4">
          <p className="text-sm text-dark-6">
            Please provide a reason for cancelling this booking. This is optional but helps us improve the service.
          </p>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Cancellation reason (optional)"
            className="w-full border border-stroke bg-white px-3 py-2 text-sm text-dark outline-none transition-colors placeholder:text-dark-5 focus:border-primary focus:ring-1 focus:ring-primary"
            rows={4}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setCancelModalOpen(false);
                setCancelTargetId(null);
                setCancelReason('');
              }}
              className="px-4 py-2 text-sm font-medium text-dark border border-stroke rounded hover:bg-gray-50"
            >
              Skip
            </button>
            <button
              onClick={handleCancelSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-red hover:bg-red-dark rounded"
            >
              Cancel Booking
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
