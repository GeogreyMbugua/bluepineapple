import { queryOptions } from '@tanstack/react-query';
import type { PartnerRow } from '@/components/admin/types';

export function adminPartnersOptions(status?: string) {
  return queryOptions({
    queryKey: ['admin', 'partners', status ?? 'all'] as const,
    queryFn: async () => {
      const url = status && status !== 'ALL' ? `/api/admin/partners?status=${encodeURIComponent(status)}` : '/api/admin/partners';
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to fetch partners');
      }
      const json = await res.json();
      return (json.data?.partners ?? []) as PartnerRow[];
    },
    staleTime: 2 * 60_000,
  });
}
