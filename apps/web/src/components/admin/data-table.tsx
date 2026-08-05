'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@/components/admin/icons';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/admin/ui/table';
import type { ColumnDef, SortingState, PaginationState } from './types';

type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  pageSize?: number;
};

type SortableHeaderProps<T> = {
  column: ColumnDef<T>;
  sorting: SortingState;
  onSort: (key: string) => void;
};

function SortableHeader<T>({ column, sorting, onSort }: SortableHeaderProps<T>) {
  if (!column.sortable) {
    return <TableHead>{column.header}</TableHead>;
  }

  const sortDir = sorting.key === column.key ? sorting.direction : null;

  return (
    <TableHead>
      <button
        type="button"
        onClick={() => onSort(column.key)}
        className="flex items-center gap-1 hover:text-primary"
      >
        {column.header}
        {sortDir === 'asc' && <ChevronUpIcon className="size-4" />}
        {sortDir === 'desc' && <ChevronDownIcon className="size-4" />}
      </button>
    </TableHead>
  );
}

export function DataTable<T>({ data, columns, pageSize = 10 }: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>({ key: '', direction: null });
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize });

  const sortedData = [...data].sort((a, b) => {
    if (!sorting.key || !sorting.direction) return 0;
    const aVal = a[sorting.key as keyof T];
    const bVal = b[sorting.key as keyof T];
    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    const cmp = aVal < bVal ? -1 : 1;
    return sorting.direction === 'asc' ? cmp : -cmp;
  });

  const pageCount = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    pagination.pageIndex * pageSize,
    (pagination.pageIndex + 1) * pageSize
  );

  const handleSort = (key: string) => {
    setSorting((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div className="border border-stroke bg-white shadow-1">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-stroke bg-muted">
            {columns.map((col) => (
              <SortableHeader
                key={String(col.key)}
                column={col}
                sorting={sorting}
                onSort={handleSort}
              />
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-8 text-center text-gray-500">
                No data found
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((row, idx) => (
              <TableRow key={idx} className="border-b border-gray-100">
                {columns.map((col) => (
                  <TableCell key={String(col.key)}>
                    {col.cell
                      ? col.cell(row)
                      : row[col.key as keyof T] as React.ReactNode}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pageCount > 1 && (
        <div className="flex items-center justify-between border-t border-stroke px-4 py-3">
          <span className="text-sm text-gray-500">
            Page {pagination.pageIndex + 1} of {pageCount}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setPagination((p) => ({ ...p, pageIndex: Math.max(0, p.pageIndex - 1) }))
              }
              disabled={pagination.pageIndex === 0}
              className="border border-stroke px-3 py-1 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() =>
                setPagination((p) => ({
                  ...p,
                  pageIndex: Math.min(pageCount - 1, p.pageIndex + 1),
                }))
              }
              disabled={pagination.pageIndex >= pageCount - 1}
              className="border border-stroke px-3 py-1 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
