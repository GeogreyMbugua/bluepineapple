import { queryOptions } from '@tanstack/react-query';
import type { UserRow } from '@/components/admin/types';

export interface UsersOptionsParams {
  includePartners?: boolean;
  includePendingVerification?: boolean;
}

export function adminUsersOptions(params: UsersOptionsParams = {}) {
  return queryOptions({
    queryKey: ['admin', 'users', params.includePartners ?? false, params.includePendingVerification ?? false] as const,
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.includePartners) searchParams.set('includePartners', 'true');
      if (params.includePendingVerification) searchParams.set('includePendingVerification', 'true');
      const qs = searchParams.toString();
      const url = `/api/admin/users${qs ? `?${qs}` : ''}`;

      const res = await fetch(url, { cache: 'no-store', credentials: 'include' });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch users: ${res.status} ${text}`);
      }
      const json = await res.json();
      return (json.data?.users ?? []) as UserRow[];
    },
    staleTime: 2 * 60_000,
  });
}
