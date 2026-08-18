import { getServerSession } from '@/lib/auth';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/queries/get-query-client';
import { partnerProfileOptions, partnerBookingsOptions } from '@/lib/queries/partner';
import { PartnerBookingsClient } from '@/components/partner/partner-bookings-client';

export const dynamic = 'force-dynamic';

export default async function PartnerBookingsPage() {
  const session = await getServerSession();
  if (!session.user) {
    return null;
  }

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(partnerProfileOptions()),
    queryClient.prefetchQuery(partnerBookingsOptions()),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PartnerBookingsClient />
    </HydrationBoundary>
  );
}
