import Link from 'next/link';
import { DataTable } from '@/components/admin/data-table';
import type { ColumnDef } from '@/components/admin/types';

const STATUS_FILTERS = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
] as const;

type StatusFilter = typeof STATUS_FILTERS[number]['value'];

interface PartnerDashboardBookingsProps<T> {
  bookings: T[];
  columns: ColumnDef<T>[];
  activeStatus: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  totalBookings: number;
  isLoading: boolean;
  onCreateBooking?: () => void;
}

export function PartnerDashboardBookings<T>({
  bookings,
  columns,
  activeStatus,
  onStatusChange,
  totalBookings,
  isLoading,
  onCreateBooking,
}: PartnerDashboardBookingsProps<T>) {
  return (
    <div className="border border-stroke bg-white shadow-1 rounded-lg overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-stroke px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
        <div>
          <h2 className="text-lg font-bold text-dark">Recent Bookings</h2>
          <p className="text-xs text-dark-6 sm:text-sm">
            {totalBookings} total booking{totalBookings !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/partner/bookings"
            className="inline-flex items-center gap-1 rounded border border-stroke px-3 py-1.5 text-xs font-medium text-dark hover:bg-muted sm:text-sm"
          >
            View All
          </Link>
          {onCreateBooking ? (
            <button
              type="button"
              onClick={onCreateBooking}
              className="inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-deep sm:text-sm"
            >
              Create Booking
            </button>
          ) : (
            <Link
              href="/partner/bookings"
              className="inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-deep sm:text-sm"
            >
              Create Booking
            </Link>
          )}
        </div>
      </div>

      {/* Status Filters */}
      <div className="border-b border-stroke px-4 py-3 sm:px-6">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => onStatusChange(value)}
              disabled={isLoading}
              className={[
                'rounded border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 sm:px-4 sm:py-2 sm:text-sm',
                activeStatus === value
                  ? 'border-cyan-deep bg-primary text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-cyan hover:text-primary-deep',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={bookings}
        columns={columns}
        pageSize={5}
      />

      {bookings.length === 0 && (
        <div className="px-6 py-8 text-center text-dark-5">
          No bookings found{activeStatus !== 'ALL' ? ` with status "${activeStatus}"` : ''}.
          <Link href="/partner/bookings" className="ml-1 text-primary hover:underline">
            Create your first booking
          </Link>
        </div>
      )}
    </div>
  );
}
