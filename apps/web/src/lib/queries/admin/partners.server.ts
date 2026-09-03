import { queryOptions } from '@tanstack/react-query';
import { getAdminPartnerDetail, getAdminPartnersList } from '@/lib/admin/partners';
import { adminPartnerDetailQueryKey, adminPartnersQueryKey } from '@/lib/queries/admin/partners';

export function adminPartnersServerOptions(params: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  return queryOptions({
    queryKey: adminPartnersQueryKey(params),
    queryFn: () => getAdminPartnersList(params),
    staleTime: 2 * 60_000,
  });
}

export function adminPartnerDetailServerOptions(partnerId: string) {
  return queryOptions({
    queryKey: adminPartnerDetailQueryKey(partnerId),
    queryFn: () => getAdminPartnerDetail(partnerId),
    staleTime: 60_000,
  });
}
