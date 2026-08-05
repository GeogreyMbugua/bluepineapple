'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/data-table';
import type { ColumnDef } from '@/components/admin/types';
import type { ExperienceRow } from '@/components/admin/types';
import Link from 'next/link';

async function fetchExperiences() {
  const res = await fetch('/api/admin/experiences', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch experiences');
  const json = await res.json();
  return json.data as ExperienceRow[];
}

export default function AdminExperiencesPage() {
  const [experiences, setExperiences] = useState<ExperienceRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const data = await fetchExperiences();
        setExperiences(data);
      } catch {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const columns: ColumnDef<ExperienceRow>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      cell: (row) => (
        <Link href={`/admin/experiences/${row.id}`} className="text-primary-deep hover:underline">
          {row.name}
        </Link>
      ),
    },
    { key: 'slug', header: 'Slug', sortable: true },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      cell: (row) => <span className="capitalize">{row.category.toLowerCase()}</span>,
    },
    {
      key: 'durationMinutes',
      header: 'Duration',
      sortable: true,
      cell: (row) => row.durationMinutes ? `${row.durationMinutes} min` : '—',
    },
    {
      key: 'defaultPrice',
      header: 'Price',
      sortable: true,
      cell: (row) => row.defaultPrice ? `${row.currency} ${Number(row.defaultPrice).toLocaleString()}` : '—',
    },
    {
      key: 'isFeatured',
      header: 'Featured',
      sortable: true,
      cell: (row) => (
        <span className={`inline-block px-2 py-1 text-xs font-medium ${row.isFeatured ? 'bg-green-light-6 text-green' : 'bg-gray-100 text-gray-500'}`}>
          {row.isFeatured ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      cell: (row) => <StatusBadge isActive={row.isActive} />,
    },
    {
      key: 'maxGroupSize',
      header: 'Max Group',
      sortable: true,
      cell: (row) => row.maxGroupSize || '—',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark">Experiences</h1>
          <p className="text-dark-6 mt-1">Manage coastal experiences and activities</p>
        </div>
        <Link
          href="/admin/experiences/create"
          className="px-4 py-2 bg-primary text-white text-sm font-medium hover:bg-primary-deep"
        >
          Add Experience
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
          <DataTable data={experiences} columns={columns} pageSize={10} />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium ${isActive ? 'bg-green-light-6 text-green' : 'bg-gray-100 text-gray-500'}`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}
