import { UsersTableContent } from '@/components/admin/users/users-table-content';
import { getServerSession } from '@/lib/auth';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

async function getBaseUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://${host}`;
}

async function getUsers() {
  const base = await getBaseUrl();
  const cookieHeader = (await headers()).get('cookie') || '';
  const res = await fetch(`${base}/api/admin/users`, {
    cache: 'no-store',
    headers: { Cookie: cookieHeader },
  });
  if (!res.ok) return { users: [] };
  const json = await res.json();
  return json.data;
}

export default async function AdminUsersPage() {
  const session = await getServerSession();
  if (!session.user) {
    return null;
  }

  const { users } = await getUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark">Users</h1>
        <p className="text-dark-6 mt-1">Manage user accounts and roles</p>
      </div>
      <UsersTableContent users={users} />
    </div>
  );
}