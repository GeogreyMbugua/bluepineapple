import { getServerSession } from '@/lib/auth';
import { getPartnerProfile } from '@/lib/services/partner-dashboard.service';
import { BookingsPageHeader } from '@/components/partner/bookings-page-header';
import { PartnerBookingsTable } from '@/components/partner/partner-bookings-table';

export const dynamic = 'force-dynamic';

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
        <PartnerBookingsTable userId={session.user.id} />
      </div>
    </div>
  );
}
