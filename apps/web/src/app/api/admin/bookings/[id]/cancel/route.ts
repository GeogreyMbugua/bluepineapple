import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { bookingService } from '@blue-pineapple/iam';
import { z } from 'zod';

const CancelBookingSchema = z.object({
  reason: z.string().max(500).optional().nullable(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const body = await request.json();
    const validated = CancelBookingSchema.parse(body);
    const { id } = await params;

    await bookingService.cancelBooking(id, {
      reason: validated.reason ?? null,
    }, result.id);
    return Response.json({ message: 'Booking cancelled' }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues?.[0]?.message || error.message || 'Validation failed';
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message } },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      return Response.json(
        { error: { code: 'OPERATION_FAILED', message: error.message } },
        { status: 400 }
      );
    }
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to cancel booking' } },
      { status: 500 }
    );
  }
}
