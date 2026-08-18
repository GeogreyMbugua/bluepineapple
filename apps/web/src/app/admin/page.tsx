import { getServerSession } from '@/lib/auth';
import { DashboardContent } from '@/components/admin/dashboard-content';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/queries/get-query-client';
import { adminDashboardOptions, adminPartnerStatsOptions, adminTripCalendarOptions } from '@/lib/queries/admin';

export default async function AdminDashboardPage() {
  const session = await getServerSession();
  if (!session.user) {
    return null;
  }

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(adminDashboardOptions()),
    queryClient.prefetchQuery(adminPartnerStatsOptions()),
    queryClient.prefetchQuery(adminTripCalendarOptions()),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardContent />
    </HydrationBoundary>
  );
}
