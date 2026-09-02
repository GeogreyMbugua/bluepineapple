import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { bookingService } from '@blue-pineapple/iam';
import { initializeIam } from '@/lib/server/iam-init';
import { z } from 'zod';

const ConfirmBookingSchema = z.object({
  departureTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'A valid departure time is required'),
});

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdminAuth(_request);
  if (result instanceof Response) return result;

  try {
    initializeIam();
    const { id } = await params;
    const payload = ConfirmBookingSchema.safeParse(await _request.json());
    if (!payload.success) {
      return Response.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message:
              payload.error.issues[0]?.message ??
              'A valid departure time is required',
          },
        },
        { status: 400 },
      );
    }
    await bookingService.confirmBooking(
      id,
      result.id,
      payload.data.departureTime,
    );
    return Response.json({ message: 'Booking confirmed' }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json(
        { error: { code: 'OPERATION_FAILED', message: error.message } },
        { status: 400 }
      );
    }
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to confirm booking' } },
      { status: 500 }
    );
  }
}
