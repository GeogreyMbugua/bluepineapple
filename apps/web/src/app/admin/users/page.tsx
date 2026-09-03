import { UsersTableContent } from '@/components/admin/users/users-table-content';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/queries/get-query-client';
import { adminUsersServerOptions } from '@/lib/queries/admin/users.server';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(
    adminUsersServerOptions({ includePartners: false, includePendingVerification: false }),
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark sm:text-3xl">Users</h1>
        <p className="mt-1 text-xs text-dark-6 sm:text-sm">Manage user accounts and roles</p>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <UsersTableContent />
      </HydrationBoundary>
    </div>
  );
}
