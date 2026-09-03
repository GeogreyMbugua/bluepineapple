import { queryOptions } from '@tanstack/react-query';
import { getAdminDashboardData } from '@/lib/admin/dashboard';
import { adminDashboardQueryKey } from '@/lib/queries/admin/dashboard';

export function adminDashboardServerOptions() {
  return queryOptions({
    queryKey: adminDashboardQueryKey(),
    queryFn: () => getAdminDashboardData(),
    staleTime: 30_000,
  });
}
