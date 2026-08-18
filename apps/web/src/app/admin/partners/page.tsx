import { getServerSession } from '@/lib/auth';
import { PartnersClient } from '@/components/admin/partners/partners-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/queries/get-query-client';
import { adminPartnersOptions } from '@/lib/queries/admin/partners';

export default async function AdminPartnersPage() {
  const session = await getServerSession();
  if (!session.user) {
    return null;
  }

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(adminPartnersOptions());

  return (
    <div className="space-y-6">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PartnersClient />
      </HydrationBoundary>
    </div>
  );
}
