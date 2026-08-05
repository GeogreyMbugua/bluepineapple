import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { bookingService } from '@blue-pineapple/iam';
import type { BookingRow } from '@/components/admin/types';

export async function GET(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const bookings = await bookingService.searchBookings({ status, limit });

    const mapped: BookingRow[] = bookings.map((booking) => ({
      id: booking.id,
      bookingReference: booking.bookingReference,
      experience: booking.departure?.experience?.name ?? 'Unknown',
      partner: booking.partner?.companyName ?? 'Direct',
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      amount: `KES ${Number(booking.totalAmount).toLocaleString()}`,
      date: booking.createdAt.toISOString(),
    }));

    return Response.json({ data: { bookings: mapped }, timestamp: new Date().toISOString() });
  } catch {
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch bookings' } },
      { status: 500 }
    );
  }
}
