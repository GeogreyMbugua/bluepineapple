import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { bookingService } from '@blue-pineapple/iam';
import { initializeIam } from '@/lib/server/iam-init';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdminAuth(_request);
  if (result instanceof Response) return result;

  try {
    initializeIam();
    const { id } = await params;
    await bookingService.confirmBooking(id, result.id);
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
