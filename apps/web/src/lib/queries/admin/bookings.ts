import { queryOptions } from '@tanstack/react-query';
import type { BookingRow } from '@/components/admin/types';

export interface BookingsOptionsParams {
  status?: string;
  limit?: number;
}

export function adminBookingsQueryKey(params: BookingsOptionsParams = {}) {
  return ['admin', 'bookings', params.status ?? 'ALL', params.limit ?? 50] as const;
}

export function adminBookingsOptions(params: BookingsOptionsParams = {}) {
  return queryOptions({
    queryKey: adminBookingsQueryKey(params),
    queryFn: async () => {
      const url = new URL('/api/admin/bookings');
      if (params.status) url.searchParams.set('status', params.status);
      if (params.limit) url.searchParams.set('limit', String(params.limit));

      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const json = await res.json();
      return (json.data?.bookings ?? []) as BookingRow[];
    },
    staleTime: 30_000,
  });
}
