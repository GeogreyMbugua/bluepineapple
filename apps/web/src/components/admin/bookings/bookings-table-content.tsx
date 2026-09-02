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
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<string | null>(null);
  const [confirmDepartureTime, setConfirmDepartureTime] = useState('09:30');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const openConfirmModal = (id: string) => {
    setConfirmTargetId(id);
    setConfirmDepartureTime('09:30');
    setConfirmModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!confirmTargetId || !confirmDepartureTime) return;

    const id = confirmTargetId;
    setConfirmingIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/admin/bookings/${id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departureTime: confirmDepartureTime }),
        credentials: 'include',
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed to confirm booking');
      }

      addToast('Booking confirmed successfully', 'success');
      setConfirmModalOpen(false);
      setConfirmTargetId(null);
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
    { key: 'departureTime', header: 'Departure', sortable: true },
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
                onClick={() => openConfirmModal(row.id)}
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
        open={confirmModalOpen}
        onClose={() => {
          if (confirmTargetId && confirmingIds.has(confirmTargetId)) return;
          setConfirmModalOpen(false);
          setConfirmTargetId(null);
        }}
        title="Confirm Booking"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-dark-6">
            Set the departure time for this booking before confirming it.
            Customers do not choose a departure time during booking.
          </p>
          <label className="block text-sm font-medium text-dark">
            Departure time
            <input
              type="time"
              value={confirmDepartureTime}
              onChange={(event) => setConfirmDepartureTime(event.target.value)}
              disabled={Boolean(confirmTargetId && confirmingIds.has(confirmTargetId))}
              className="mt-2 block w-full border border-stroke bg-white px-3 py-3 text-base text-dark outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-gray-100"
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setConfirmModalOpen(false);
                setConfirmTargetId(null);
              }}
              disabled={Boolean(confirmTargetId && confirmingIds.has(confirmTargetId))}
              className="rounded px-4 py-2 text-sm font-medium text-dark border border-stroke hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={
                !confirmDepartureTime ||
                Boolean(confirmTargetId && confirmingIds.has(confirmTargetId))
              }
              className="rounded bg-green px-4 py-2 text-sm font-medium text-white hover:bg-green-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {confirmTargetId && confirmingIds.has(confirmTargetId)
                ? 'Confirming...'
                : 'Confirm booking'}
            </button>
          </div>
        </div>
      </Modal>

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
