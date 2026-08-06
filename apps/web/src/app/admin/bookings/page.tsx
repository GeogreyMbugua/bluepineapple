import { Suspense } from 'react';
import { getServerSession } from '@/lib/auth';
import { getAdminBookings } from '@/lib/services/admin-bookings.service';
import { BookingsClient } from '@/components/admin/bookings/bookings-client';

export const dynamic = 'force-dynamic';

export default async function AdminBookingsPage() {
  const session = await getServerSession();
  if (!session.user) {
    return null;
  }

  // Initial server-side hydration — eliminates client-side loading flash
  const initialBookings = await getAdminBookings({ limit: 50 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark">Bookings</h1>
        <p className="mt-1 text-dark-6">View and manage bookings</p>
      </div>
      <Suspense fallback={
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse bg-gray-100" />
          ))}
        </div>
      }>
        <BookingsClient initialBookings={initialBookings} />
      </Suspense>
    </div>
  );
}
