import { queryOptions } from '@tanstack/react-query';
import type { PartnerProfileData } from '@blue-pineapple/iam';

export function partnerProfileOptions() {
  return queryOptions({
    queryKey: ['partner', 'profile'] as const,
    queryFn: async () => {
      const res = await fetch('/api/partner/me', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to fetch profile');
      }
      const json = await res.json();
      return json.data as PartnerProfileData;
    },
    staleTime: 30_000,
  });
}
