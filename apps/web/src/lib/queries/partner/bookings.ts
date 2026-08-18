import { queryOptions } from '@tanstack/react-query';
import type { PartnerBookingRow } from '@/lib/services/partner-dashboard.service';

export interface PartnerBookingsOptionsParams {
  limit?: number;
  offset?: number;
}

export function partnerBookingsOptions(params: PartnerBookingsOptionsParams = {}) {
  return queryOptions({
    queryKey: ['partner', 'bookings', params.limit ?? 50, params.offset ?? 0] as const,
    queryFn: async () => {
      const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
      const url = new URL('/api/partner/bookings', base);
      if (params.limit) url.searchParams.set('limit', String(params.limit));
      if (params.offset) url.searchParams.set('offset', String(params.offset));

      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const json = await res.json();
      return (json.data ?? []) as PartnerBookingRow[];
    },
    staleTime: 30_000,
  });
}
