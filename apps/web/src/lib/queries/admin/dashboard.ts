import { queryOptions } from '@tanstack/react-query';
import type { DashboardData } from '@/components/admin/types';

export function adminDashboardOptions() {
  return queryOptions({
    queryKey: ['admin', 'dashboard'] as const,
    queryFn: async () => {
      const res = await fetch('/api/admin/dashboard', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const json = await res.json();
      return json.data as DashboardData;
    },
    staleTime: 30_000,
  });
}
