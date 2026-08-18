import { queryOptions } from '@tanstack/react-query';
import type { PartnerRow } from '@/components/admin/types';

export function adminPartnerStatsOptions() {
  return queryOptions({
    queryKey: ['admin', 'partners', 'stats'] as const,
    queryFn: async () => {
      const res = await fetch('/api/admin/partners/stats', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to fetch partner stats');
      }
      const json = await res.json();
      return (json.data ?? []) as PartnerRow[];
    },
    staleTime: 2 * 60_000,
  });
}
