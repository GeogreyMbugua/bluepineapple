import { queryOptions } from '@tanstack/react-query';
import type { PartnerDashboardData } from '@/lib/services/partner-dashboard.service';

export interface PartnerDashboardOptionsParams {
  status?: string;
}

export function partnerDashboardOptions(params: PartnerDashboardOptionsParams = {}) {
  return queryOptions({
    queryKey: ['partner', 'dashboard', params.status ?? 'ALL'] as const,
    queryFn: async () => {
      const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
      const url = new URL('/api/partner/dashboard', base);
      if (params.status && params.status !== 'ALL') {
        url.searchParams.set('status', params.status);
      }

      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const json = await res.json();
      return json.data as PartnerDashboardData;
    },
    staleTime: 30_000,
  });
}
