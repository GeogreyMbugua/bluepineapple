import { DashboardContent } from '@/components/admin/dashboard-content';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/queries/get-query-client';
import { adminDashboardServerOptions } from '@/lib/queries/admin/dashboard.server';
import { adminPartnerStatsServerOptions } from '@/lib/queries/admin/partner-stats.server';
import { adminTripCalendarServerOptions } from '@/lib/queries/admin/trip-calendar.server';

export default async function AdminDashboardPage() {
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(adminDashboardServerOptions()),
    queryClient.prefetchQuery(adminPartnerStatsServerOptions()),
    queryClient.prefetchQuery(adminTripCalendarServerOptions()),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardContent />
    </HydrationBoundary>
  );
}
