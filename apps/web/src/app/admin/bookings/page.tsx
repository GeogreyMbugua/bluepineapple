import { getServerSession } from '@/lib/auth';
import { BookingsClient } from '@/components/admin/bookings/bookings-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/queries/get-query-client';
import { adminBookingsOptions } from '@/lib/queries/admin/bookings';

export default async function AdminBookingsPage() {
  const session = await getServerSession();
  if (!session.user) {
    return null;
  }

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(adminBookingsOptions({ status: 'ALL', limit: 50 }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark">Bookings</h1>
        <p className="mt-1 text-dark-6">View and manage bookings</p>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <BookingsClient />
      </HydrationBoundary>
    </div>
  );
}
