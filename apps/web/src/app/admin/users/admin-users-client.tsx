'use client';

import { useEffect, useState } from 'react';
import type { AuthUser } from '@/features/auth/types';

export function AdminUsersClient() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/admin/users');
        const json = await res.json();
        if (json.data?.users) {
          setUsers(json.data.users);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-dark-6">Loading users...</div>;

  return (
    <div className="border border-stroke bg-white shadow-1">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-3 text-xs font-medium text-dark-5 uppercase">ID</th>
            <th className="text-left p-3 text-xs font-medium text-dark-5 uppercase">Email</th>
            <th className="text-left p-3 text-xs font-medium text-dark-5 uppercase">Roles</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="border-t border-gray-200">
              <td className="p-3 font-mono text-xs text-dark-5">{user.id}</td>
              <td className="p-3 text-dark">{user.email}</td>
              <td className="p-3">{user.roles.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
