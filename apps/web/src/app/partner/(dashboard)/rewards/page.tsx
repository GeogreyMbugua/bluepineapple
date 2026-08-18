import { getServerSession } from '@/lib/auth';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/queries/get-query-client';
import { partnerRewardsOptions, partnerProfileOptions } from '@/lib/queries/partner';
import { PartnerRewardsClient } from '@/components/partner/partner-rewards-client';

export const dynamic = 'force-dynamic';

export default async function PartnerRewardsPage() {
  const session = await getServerSession();
  if (!session.user) {
    return null;
  }

  const queryClient = getQueryClient();
  const currentYear = new Date().getFullYear();
  await Promise.all([
    queryClient.prefetchQuery(partnerRewardsOptions({ year: currentYear })),
    queryClient.prefetchQuery(partnerProfileOptions()),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PartnerRewardsClient />
    </HydrationBoundary>
  );
}
