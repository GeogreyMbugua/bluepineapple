import { queryOptions } from '@tanstack/react-query';
import type { PartnerRow } from '@/components/admin/types';

export interface PartnerListResult {
  partners: PartnerRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statusCounts: Record<string, number>;
}

export function adminPartnersOptions(params: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  const { status, search, page = 1, limit = 20 } = params;
  return queryOptions({
    queryKey: ['admin', 'partners', status ?? 'all', search ?? '', page, limit] as const,
    queryFn: async () => {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (status && status !== 'ALL') query.set('status', status);
      if (search?.trim()) query.set('search', search.trim());

      const url = `/api/admin/partners?${query.toString()}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to fetch partners');
      }
      const json = await res.json();
      return (json.data ?? {
        partners: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        statusCounts: {},
      }) as PartnerListResult;
    },
    staleTime: 2 * 60_000,
  });
}
