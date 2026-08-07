'use client';

import { useState, useMemo } from 'react';
import { SearchIcon } from '@/components/admin/icons';
import { Input } from '@/components/admin/ui/input';
import { DataTable } from '@/components/admin/data-table';
import type { ColumnDef } from '@/components/admin/types';
import type { UserRow } from '@/components/admin/types';
import { CreateUserModal } from '@/components/admin/users/create-user-modal';

interface UsersTableContentProps {
  users: UserRow[];
  onUpdate?: () => void;
}

export function UsersTableContent({ users, onUpdate }: UsersTableContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase().trim();
    return users.filter((u) => {
      const fullName = `${u.firstName ?? ''} ${u.lastName ?? ''}`.toLowerCase();
      const email = (u.email ?? '').toLowerCase();
      const phone = (u.phone ?? '').toLowerCase();
      return fullName.includes(query) || email.includes(query) || phone.includes(query);
    });
  }, [users, searchQuery]);

  const userColumns: ColumnDef<UserRow>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      cell: (row) => {
        const fullName = `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim();
        return <span className="font-medium text-dark">{fullName || '—'}</span>;
      },
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      cell: (row) => <span className="text-dark-6">{row.email || '—'}</span>,
    },
    {
      key: 'phone',
      header: 'Phone',
      sortable: false,
      cell: (row) => <span className="text-dark-6">{row.phone || '—'}</span>,
    },
    {
      key: 'roles',
      header: 'Roles',
      sortable: false,
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.roles?.length > 0 ? (
            row.roles.map((role) => (
              <span
                key={role}
                className="inline-block px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary-deep"
              >
                {role}
              </span>
            ))
          ) : (
            <span className="text-dark-6">—</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dark-5" />
          <Input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-dark-6">
            Showing {filteredUsers.length} of {users.length} users
          </p>
          <Button onClick={() => setShowCreateModal(true)}>Create User</Button>
        </div>
      </div>

      <DataTable data={filteredUsers} columns={userColumns} pageSize={10} />

      <CreateUserModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={onUpdate}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-light-6 text-green',
    INACTIVE: 'bg-gray-100 text-gray-500',
    PENDING_VERIFICATION: 'bg-yellow-light-4 text-yellow-dark',
    PENDING: 'bg-orange-100 text-orange-800',
  };

  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}
