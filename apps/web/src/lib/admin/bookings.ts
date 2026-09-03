import { bookingService } from '@blue-pineapple/iam';
import type { BookingStatus } from '@blue-pineapple/database';
import type { BookingRow } from '@/components/admin/types';

function mapBookingRow(
  booking: Awaited<ReturnType<typeof bookingService.searchBookings>>[number],
): BookingRow {
  const departureDateTime =
    booking.confirmedDepartureTime ?? booking.departure?.departureDateTime;

  return {
    id: booking.id,
    bookingReference: booking.bookingReference,
    experience: booking.departure?.experience?.name ?? 'Unknown',
    partner: booking.partner?.companyName ?? 'Direct',
    departureTime: departureDateTime
      ? new Date(departureDateTime).toLocaleTimeString('en-KE', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Africa/Nairobi',
        })
      : '—',
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    amount: `KES ${Number(booking.totalAmount).toLocaleString()}`,
    date: booking.createdAt.toISOString(),
  };
}

export async function getAdminBookings(params: {
  status?: string;
  limit?: number;
} = {}): Promise<BookingRow[]> {
  const { status = 'ALL', limit = 20 } = params;
  const bookings = await bookingService.searchBookings({
    status: status as BookingStatus | string,
    limit,
  });
  return bookings.map(mapBookingRow);
}
