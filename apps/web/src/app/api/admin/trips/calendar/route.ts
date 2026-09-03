import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { getAdminTripCalendar } from '@/lib/admin/trip-calendar';
import { z } from 'zod';

const TripCalendarQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  experienceSlug: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const { searchParams } = new URL(request.url);
    const query = TripCalendarQuerySchema.parse(Object.fromEntries(searchParams));
    const data = await getAdminTripCalendar({
      experienceSlug: query.experienceSlug,
      startStr: query.startDate,
      endStr: query.endDate,
    });

    return Response.json({
      data,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch trip calendar' } },
      { status: 500 }
    );
  }
}
