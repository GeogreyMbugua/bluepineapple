import { BookingsClient } from '@/components/admin/bookings/bookings-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/queries/get-query-client';
import { adminBookingsServerOptions } from '@/lib/queries/admin/bookings.server';

export default async function AdminBookingsPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(adminBookingsServerOptions({ status: 'ALL', limit: 50 }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark">Bookings</h1>
        <p className="mt-1 text-dark-6">View, manage, and create partner bookings</p>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <BookingsClient />
      </HydrationBoundary>
    </div>
  );
}
