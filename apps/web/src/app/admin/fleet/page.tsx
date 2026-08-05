'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/data-table';
import type { ColumnDef } from '@/components/admin/types';
import type { VesselRow } from '@/components/admin/types';
import Link from 'next/link';

async function fetchVessels() {
  const res = await fetch('/api/admin/fleet', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch vessels');
  const json = await res.json();
  return json.data as VesselRow[];
}

export default function AdminFleetPage() {
  const [vessels, setVessels] = useState<VesselRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const data = await fetchVessels();
        setVessels(data);
      } catch {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const columns: ColumnDef<VesselRow>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      cell: (row) => (
        <Link href={`/admin/fleet/${row.id}`} className="text-primary-deep hover:underline">
          {row.name}
        </Link>
      ),
    },
    { key: 'slug', header: 'Slug', sortable: true },
    { key: 'type', header: 'Type', sortable: true },
    { key: 'capacity', header: 'Capacity', sortable: true },
    { key: 'operatorName', header: 'Operator', sortable: true },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'hourlyRate',
      header: 'Hourly Rate',
      cell: (row) => row.hourlyRate || '—',
    },
    {
      key: 'dailyRate',
      header: 'Daily Rate',
      cell: (row) => row.dailyRate || '—',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark">Fleet</h1>
          <p className="text-dark-6 mt-1">Manage vessels and boats</p>
        </div>
        <Link
          href="/admin/fleet/create"
          className="px-4 py-2 bg-primary text-white text-sm font-medium hover:bg-primary-deep"
        >
          Add Vessel
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="border border-stroke bg-white shadow-1">
          <DataTable data={vessels} columns={columns} pageSize={10} />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-light-6 text-green',
    INACTIVE: 'bg-gray-100 text-gray-500',
    MAINTENANCE: 'bg-yellow-light-4 text-yellow-dark',
    DECOMMISSIONED: 'bg-red-light-5 text-red',
  };

  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}
