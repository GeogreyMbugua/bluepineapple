import { queryOptions } from '@tanstack/react-query';
import { getAdminUsers } from '@/lib/admin/users';
import {
  adminUsersQueryKey,
  type UsersOptionsParams,
} from '@/lib/queries/admin/users';

export function adminUsersServerOptions(params: UsersOptionsParams = {}) {
  return queryOptions({
    queryKey: adminUsersQueryKey(params),
    queryFn: () => getAdminUsers(params),
    staleTime: 2 * 60_000,
  });
}
