import { PartnersClient } from '@/components/admin/partners/partners-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/queries/get-query-client';
import { adminPartnersServerOptions } from '@/lib/queries/admin/partners.server';

export default async function AdminPartnersPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(adminPartnersServerOptions());

  return (
    <div className="space-y-6">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PartnersClient />
      </HydrationBoundary>
    </div>
  );
}
