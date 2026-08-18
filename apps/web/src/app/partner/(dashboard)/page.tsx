import { getServerSession } from '@/lib/auth';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/queries/get-query-client';
import { partnerDashboardOptions } from '@/lib/queries/partner';
import { PartnerDashboardClient } from '@/components/partner/partner-dashboard-client';

export const dynamic = 'force-dynamic';

export default async function PartnerDashboardPage() {
  const session = await getServerSession();
  if (!session.user) {
    return null;
  }

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(partnerDashboardOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PartnerDashboardClient />
    </HydrationBoundary>
  );
}
