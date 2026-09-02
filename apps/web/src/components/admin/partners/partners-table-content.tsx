'use client';

import { DataTable } from '@/components/admin/data-table';
import Link from 'next/link';
import type { ColumnDef } from '@/components/admin/types';
import type { PartnerRow } from '@/components/admin/types';

interface PartnersTableContentProps {
  partners: PartnerRow[];
}

export function PartnersTableContent({ partners }: PartnersTableContentProps) {
  const columns: ColumnDef<PartnerRow>[] = [
    {
      key: 'partnerCode',
      header: 'Code',
      sortable: true,
      cell: (row) => (
        <Link
          href={`/admin/partners/${row.id}`}
          className="text-primary-deep hover:underline"
        >
          {row.partnerCode}
        </Link>
      ),
    },
    {
      key: 'companyName',
      header: 'Company',
      sortable: true,
      cell: (row) => (
        <Link
          href={`/admin/partners/${row.id}`}
          className="text-primary-deep hover:underline"
        >
          {row.companyName || '—'}
        </Link>
      ),
    },
    {
      key: 'contactName',
      header: 'Contact',
      sortable: true,
      cell: (row) => (
        <div>
          <p className="text-sm text-dark">{row.contactName || '—'}</p>
          <p className="text-xs text-dark-5">{row.email || row.phone || 'No contact'}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'commissionRate',
      header: 'Commission',
      sortable: true,
      cell: (row) => `${row.commissionRate}%`,
    },
    { key: 'bookingCount', header: 'Bookings', sortable: true, cell: (row) => row.bookingCount ?? 0 },
    {
      key: 'clerkLinked',
      header: 'Login',
      cell: (row) => (
        <span className={row.clerkLinked ? 'text-green' : 'text-yellow-dark'}>
          {row.clerkLinked ? 'Linked' : 'Pending'}
        </span>
      ),
    },
    { key: 'joinedAt', header: 'Joined', sortable: true, cell: (row) => new Date(row.joinedAt).toLocaleDateString() },
  ];

  return <DataTable data={partners} columns={columns} pageSize={20} />;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-light-6 text-green',
    PENDING: 'bg-yellow-light-4 text-yellow-dark',
    SUSPENDED: 'bg-red-light-5 text-red',
    TERMINATED: 'bg-gray-100 text-gray-500',
  };

  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}
