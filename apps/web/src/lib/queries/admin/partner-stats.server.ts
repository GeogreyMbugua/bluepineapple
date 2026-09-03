import { queryOptions } from '@tanstack/react-query';
import { getAdminPartnerStats } from '@/lib/admin/partner-stats';
import { adminPartnerStatsQueryKey } from '@/lib/queries/admin/partner-stats';

export function adminPartnerStatsServerOptions() {
  return queryOptions({
    queryKey: adminPartnerStatsQueryKey(),
    queryFn: () => getAdminPartnerStats(),
    staleTime: 2 * 60_000,
  });
}
