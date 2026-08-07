import { UsersTableContent } from '@/components/admin/users/users-table-content';
import { getServerSession } from '@/lib/auth';
import { getAdminUsers } from '@/lib/services/admin-users.service';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const session = await getServerSession();
  if (!session.user) {
    return null;
  }

  const users = await getAdminUsers({
    includePartners: false,
    includePendingVerification: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark">Users</h1>
        <p className="mt-1 text-dark-6">Manage user accounts and roles</p>
      </div>
      <UsersTableContent users={users} onUpdate={revalidatePath('/admin/users')} />
    </div>
  );
}
