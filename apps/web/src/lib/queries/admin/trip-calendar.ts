import { queryOptions } from '@tanstack/react-query';

export interface TripCalendarOptions {
  experienceSlug?: string;
  startStr?: string;
  endStr?: string;
}

export function adminTripCalendarOptions(params: TripCalendarOptions = {}) {
  return queryOptions({
    queryKey: ['admin', 'trip-calendar', params.experienceSlug ?? 'fort-jesus', params.startStr ?? 'default', params.endStr ?? 'default'] as const,
    queryFn: async () => {
      const url = new URL('/api/admin/trips/calendar');
      if (params.experienceSlug) url.searchParams.set('experienceSlug', params.experienceSlug);
      if (params.startStr) url.searchParams.set('startDate', params.startStr);
      if (params.endStr) url.searchParams.set('endDate', params.endStr);

      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to fetch trip calendar');
      }
      const json = await res.json();
      return json.data;
    },
    staleTime: 30_000,
  });
}
