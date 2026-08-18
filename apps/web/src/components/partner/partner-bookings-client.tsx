'use client';

import { useQuery } from '@tanstack/react-query';
import { BookingsPageHeader } from '@/components/partner/bookings-page-header';
import { PartnerBookingsTable } from '@/components/partner/partner-bookings-table';
import { partnerProfileOptions, partnerBookingsOptions } from '@/lib/queries/partner';

export function PartnerBookingsClient() {
  const { data: profile, isLoading: profileLoading } = useQuery(partnerProfileOptions());
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery(partnerBookingsOptions());

  const isLoading = profileLoading || bookingsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="border border-stroke bg-white shadow-1">
          <div className="space-y-3 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 w-full animate-pulse rounded border border-stroke bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const name = (profile?.companyName ?? `${(profile?.firstName ?? '')} ${(profile?.lastName ?? '')}`.trim()) || 'Partner';

  return (
    <div className="space-y-6">
      <BookingsPageHeader partnerName={name} />
      <div className="border border-stroke bg-white shadow-1">
        <PartnerBookingsTable bookings={bookings} />
      </div>
    </div>
  );
}
