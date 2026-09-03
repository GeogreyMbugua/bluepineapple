import { PartnerDetailClient } from '@/components/admin/partners/partner-detail-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/queries/get-query-client';
import { adminPartnerDetailServerOptions } from '@/lib/queries/admin/partners.server';

export default async function AdminPartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(adminPartnerDetailServerOptions(id));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PartnerDetailClient partnerId={id} />
    </HydrationBoundary>
  );
}
