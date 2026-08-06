import { getServerSession } from '@/lib/auth';
import { getPartnerProfile } from '@/lib/services/partner-dashboard.service';
import { Suspense } from 'react';
import { Skeleton } from '@/components/admin/ui/skeleton';
import { BookingsPageHeader } from '@/components/partner/bookings-page-header';
import { PartnerBookingsTable } from '@/components/partner/partner-bookings-table';

export const dynamic = 'force-dynamic';

export interface PartnerBooking {
  id: string;
  bookingReference: string;
  experience: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  totalGuests: number;
  createdAt: string;
}

export default async function PartnerBookingsPage() {
  const session = await getServerSession();
  if (!session.user) {
    return null;
  }

  const profile = await getPartnerProfile(session.user.id);
  const name = (profile?.companyName ?? `${(profile?.firstName ?? '')} ${(profile?.lastName ?? '')}`.trim()) || 'Partner';

  return (
    <div className="space-y-6">
      <BookingsPageHeader partnerName={name} />
      <div className="border border-stroke bg-white shadow-1">
        <Suspense fallback={
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        }>
          <PartnerBookingsTable userId={session.user.id} />
        </Suspense>
      </div>
    </div>
  );
}
