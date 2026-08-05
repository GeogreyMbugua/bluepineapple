'use client';

import { DataTable } from '@/components/admin/data-table';
import type { ColumnDef } from '@/components/admin/types';
import type { UserRow, BookingRow } from '@/components/admin/types';

interface DashboardTablesProps {
  users: UserRow[];
  bookings: BookingRow[];
}

export function DashboardTables({ users, bookings }: DashboardTablesProps) {
  const userColumns: ColumnDef<UserRow>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    {
      key: 'roles',
      header: 'Roles',
      cell: (row: UserRow) => (
        <div className="flex flex-wrap gap-1">
          {row.roles?.map((role: string) => (
            <span
              key={role}
              className="inline-block px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary-deep"
            >
              {role}
            </span>
          ))}
        </div>
      ),
    },
  ];

  const bookingColumns: ColumnDef<BookingRow>[] = [
    { key: 'bookingReference', header: 'Reference', sortable: true },
    { key: 'experience', header: 'Experience', sortable: true },
    { key: 'partner', header: 'Partner', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'amount', header: 'Amount', sortable: true },
  ];

  return (
    <>
      <div className="border border-stroke bg-white shadow-1">
        <div className="border-b border-stroke border-l-[3px] border-l-primary px-6 py-5">
          <h2 className="text-2xl font-bold text-dark">Recent Users</h2>
        </div>
        <DataTable data={users} columns={userColumns} pageSize={5} />
      </div>

      <div className="border border-stroke bg-white shadow-1">
        <div className="border-b border-stroke border-l-[3px] border-l-primary px-6 py-5">
          <h2 className="text-2xl font-bold text-dark">Recent Bookings</h2>
        </div>
        <DataTable data={bookings} columns={bookingColumns} pageSize={5} />
      </div>
    </>
  );
}
