import { queryOptions } from '@tanstack/react-query';
import type { PartnerStatsRow } from '@/lib/admin/partner-stats';

export function adminPartnerStatsQueryKey() {
  return ['admin', 'partners', 'stats'] as const;
}

export function adminPartnerStatsOptions() {
  return queryOptions({
    queryKey: adminPartnerStatsQueryKey(),
    queryFn: async () => {
      const res = await fetch('/api/admin/partners/stats', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to fetch partner stats');
      }
      const json = await res.json();
      return (json.data ?? []) as PartnerStatsRow[];
    },
    staleTime: 2 * 60_000,
  });
}
