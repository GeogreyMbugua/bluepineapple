'use client';

import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarIcon, UserIcon, DollarSignIcon, GiftIcon } from '@/components/admin/icons';
import type { ColumnDef } from '@/components/admin/types';
import { partnerDashboardOptions } from '@/lib/queries/partner';
import type { PartnerDashboardData } from '@/lib/services/partner-dashboard.service';
import { Modal } from '@/components/admin/ui/modal';
import { PartnerBookingForm } from './partner-booking-form';
import { KpiCard } from './partner-dashboard-kpis';
import { PartnerDashboardBookings } from './partner-dashboard-bookings';

type StatusFilter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export function PartnerDashboardClient() {
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery(
    partnerDashboardOptions({ status: activeStatus })
  );

  const handleStatusChange = useCallback((status: StatusFilter) => {
    setActiveStatus(status);
  }, []);

  const openCreateBooking = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleBookingCreated = useCallback(() => {
    setIsCreateModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['partner', 'dashboard'] });
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-1 h-4 w-64 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-stroke bg-white p-6 shadow-1">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-8 w-20 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
        <div className="border border-stroke bg-white shadow-1">
          <div className="border-b border-stroke px-6 py-4">
            <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 w-full animate-pulse rounded border border-stroke bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-dark-6">No partner profile found</p>
      </div>
    );
  }

  const { kpis, bookings, profile, totalBookings } = data;
  const displayName = (profile.companyName ?? `${(profile.firstName ?? '')} ${(profile.lastName ?? '')}`.trim()) || 'Partner';

  const columns: ColumnDef<PartnerDashboardData['bookings'][number]>[] = [
    { key: 'bookingReference', header: 'Reference', sortable: true },
    { key: 'experience', header: 'Experience', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      cell: (row) => {
        const color =
          row.status === 'CONFIRMED'
            ? 'bg-green-light-6 text-green'
            : row.status === 'PENDING'
              ? 'bg-yellow-100 text-yellow-800'
              : row.status === 'CANCELLED'
                ? 'bg-red-light-6 text-red'
                : 'bg-gray-100 text-gray-600';
        return (
          <span className={`inline-block px-2 py-1 text-xs font-medium ${color}`}>
            {row.status}
          </span>
        );
      },
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      sortable: true,
      cell: (row) => {
        const color =
          row.paymentStatus === 'PAID'
            ? 'bg-green-light-6 text-green'
            : row.paymentStatus === 'PENDING'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-600';
        return (
          <span className={`inline-block px-2 py-1 text-xs font-medium ${color}`}>
            {row.paymentStatus}
          </span>
        );
      },
    },
    { key: 'totalGuests', header: 'Guests', sortable: true },
    {
      key: 'totalAmount',
      header: 'Amount',
      sortable: true,
      cell: (row) => `KES ${Number(row.totalAmount).toLocaleString()}`,
    },
    {
      key: 'createdAt',
      header: 'Date',
      sortable: true,
      cell: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-dark-6">
          Welcome back, {displayName}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        <KpiCard
          title="Total Bookings"
          value={kpis.totalBookings}
          icon={<CalendarIcon className="size-5 sm:size-6" />}
        />
        <KpiCard
          title="Total Guests"
          value={kpis.totalGuests}
          icon={<UserIcon className="size-5 sm:size-6" />}
        />
        <KpiCard
          title="Revenue"
          value={`KES ${kpis.revenue.toLocaleString()}`}
          icon={<DollarSignIcon className="size-5 sm:size-6" />}
        />
        <KpiCard
          title="Commission"
          value={`KES ${Math.round(kpis.commission).toLocaleString()}`}
          icon={<GiftIcon className="size-5 sm:size-6" />}
        />
      </div>

      {/* Recent Bookings */}
      <PartnerDashboardBookings
        bookings={bookings}
        columns={columns}
        activeStatus={activeStatus}
        onStatusChange={handleStatusChange}
        totalBookings={totalBookings}
        isLoading={isLoading}
        onCreateBooking={openCreateBooking}
      />

      {/* Create Booking Modal */}
      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="New Booking"
      >
        <PartnerBookingForm onBookingCreated={handleBookingCreated} />
      </Modal>
    </div>
  );
}
