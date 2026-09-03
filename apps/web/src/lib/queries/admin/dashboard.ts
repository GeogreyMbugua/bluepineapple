import { queryOptions } from '@tanstack/react-query';
import type { DashboardData } from '@/components/admin/types';

export function adminDashboardQueryKey() {
  return ['admin', 'dashboard'] as const;
}

export function adminDashboardOptions() {
  return queryOptions({
    queryKey: adminDashboardQueryKey(),
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
