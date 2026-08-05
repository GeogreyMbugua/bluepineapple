'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/data-table';
import type { ColumnDef } from '@/components/admin/types';
import { PartnerBookingForm } from '@/components/partner/partner-booking-form';

type PartnerBooking = {
  id: string;
  bookingReference: string;
  experience: string;
  status: string;
  paymentStatus: string;
  totalAmount: string;
  totalGuests: number;
  createdAt: string;
};

export default function PartnerBookingsPage() {
  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [partnerName, setPartnerName] = useState<string>('Partner');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [bookingsRes, profileRes] = await Promise.all([
          fetch('/api/partner/bookings', { cache: 'no-store' }),
          fetch('/api/partner/me', { cache: 'no-store' }),
        ]);
        
        if (cancelled) return;
        
        if (bookingsRes.ok) {
          const json = await bookingsRes.json();
          setBookings(json.data || []);
        }
        
        if (profileRes.ok) {
          const profileJson = await profileRes.json();
          if (profileJson.data?.companyName) {
            setPartnerName(profileJson.data.companyName);
          } else if (profileJson.data?.firstName && profileJson.data?.lastName) {
            setPartnerName(`${profileJson.data.firstName} ${profileJson.data.lastName}`);
          }
        }
      } catch {
        // Handle error
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const columns: ColumnDef<PartnerBooking>[] = [
    { key: 'bookingReference', header: 'Reference', sortable: true },
    { key: 'experience', header: 'Experience', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'paymentStatus', header: 'Payment', sortable: true },
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
      <div>
        <h1 className="text-3xl font-bold text-dark">Bookings</h1>
        <p className="text-dark-6 mt-1">Manage your bookings</p>
      </div>

      <PartnerBookingForm onBookingCreated={() => setRefreshKey((k) => k + 1)} partnerName={partnerName} />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="border border-stroke bg-white shadow-1">
          <DataTable data={bookings} columns={columns} pageSize={10} />
        </div>
      )}
    </div>
  );
}
