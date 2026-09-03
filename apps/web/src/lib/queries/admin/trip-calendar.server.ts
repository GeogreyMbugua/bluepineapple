import { queryOptions } from '@tanstack/react-query';
import { getAdminTripCalendar } from '@/lib/admin/trip-calendar';
import {
  adminTripCalendarQueryKey,
  type TripCalendarOptions,
} from '@/lib/queries/admin/trip-calendar';

export function adminTripCalendarServerOptions(params: TripCalendarOptions = {}) {
  return queryOptions({
    queryKey: adminTripCalendarQueryKey(params),
    queryFn: () => getAdminTripCalendar(params),
    staleTime: 30_000,
  });
}
