import { queryOptions } from '@tanstack/react-query';
import { getAdminBookings } from '@/lib/admin/bookings';
import { adminBookingsQueryKey, type BookingsOptionsParams } from '@/lib/queries/admin/bookings';

export function adminBookingsServerOptions(params: BookingsOptionsParams = {}) {
  return queryOptions({
    queryKey: adminBookingsQueryKey(params),
    queryFn: () => getAdminBookings(params),
    staleTime: 30_000,
  });
}
