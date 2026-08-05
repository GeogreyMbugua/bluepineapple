'use client';

import { useEffect, useState } from 'react';

type User = {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  status: string;
  roles: string[];
};

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data.data.users);
    } catch {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchUsers();
  }, []);

  if (isLoading) {
    return <div className="text-gray-600">Loading users...</div>;
  }

  return (
    <div className="border border-stroke bg-white overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-muted">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-dark-5 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-dark-5 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-dark-5 uppercase">Phone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-dark-5 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-dark-5 uppercase">Roles</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                {user.firstName} {user.lastName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{user.email ?? '—'}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.phone ?? '—'}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-block px-2 py-1 text-xs font-medium bg-muted text-dark-5">{user.status}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {user.roles.map((role) => (
                  <span key={role} className="mr-1 inline-block px-2 py-1 text-xs font-medium bg-primary/10 text-primary-deep">
                    {role}
                  </span>
                ))}
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-dark-6">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
