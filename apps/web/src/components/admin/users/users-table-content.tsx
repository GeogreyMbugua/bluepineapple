'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SearchIcon } from '@/components/admin/icons';
import { Input } from '@/components/admin/ui/input';
import { Button } from '@/components/admin/ui/button';
import { DataTable } from '@/components/admin/data-table';
import type { ColumnDef } from '@/components/admin/types';
import type { UserRow } from '@/components/admin/types';
import { CreateUserModal } from '@/components/admin/users/create-user-modal';
import { adminUsersOptions } from '@/lib/queries/admin/users';

export function UsersTableContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error } = useQuery(
    adminUsersOptions({ includePartners: false, includePendingVerification: false })
  );

  const invalidateUsers = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
  }, [queryClient]);

  const safeUsers = Array.isArray(users) ? users : [];

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return safeUsers;

    const query = searchQuery.toLowerCase().trim();
    return safeUsers.filter((u) => {
      const fullName = `${u.firstName ?? ''} ${u.lastName ?? ''}`.toLowerCase();
      const email = (u.email ?? '').toLowerCase();
      const phone = (u.phone ?? '').toLowerCase();
      return fullName.includes(query) || email.includes(query) || phone.includes(query);
    });
  }, [safeUsers, searchQuery]);

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

  const safeFilteredUsers = Array.isArray(filteredUsers) ? filteredUsers : [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dark-5" />
            <div className="h-10 w-full animate-pulse rounded-md bg-gray-200" />
          </div>
          <div className="h-10 w-32 animate-pulse rounded-md bg-gray-200" />
        </div>
        <div className="border border-stroke bg-white shadow-1">
          <div className="border-b border-stroke px-6 py-4">
            <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="space-y-3 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 w-full animate-pulse rounded border border-stroke bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red">Failed to load users. Please try again.</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-dark-6 sm:text-sm">
            Showing {safeFilteredUsers.length} of {safeUsers.length} users
          </p>
          <Button onClick={() => setShowCreateModal(true)} className="whitespace-nowrap">Create User</Button>
        </div>
      </div>

      <DataTable data={safeFilteredUsers} columns={userColumns} pageSize={10} />

      <CreateUserModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={invalidateUsers}
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
