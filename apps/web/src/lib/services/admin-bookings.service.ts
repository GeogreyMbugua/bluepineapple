import { bookingService } from '@blue-pineapple/iam';
import { BookingStatus } from '@blue-pineapple/database';
import type { BookingRow } from '@/components/admin/types';

export interface GetBookingsOptions {
  status?: string;
  limit?: number;
}

export async function getAdminBookings(options: GetBookingsOptions = {}): Promise<BookingRow[]> {
  try {
    const { status = 'PENDING', limit = 50 } = options;

    const bookings = await bookingService.searchBookings({
      status: status as BookingStatus,
      limit,
    });

    return bookings.map((booking) => ({
      id: booking.id,
      bookingReference: booking.bookingReference,
      experience: booking.departure?.experience?.name ?? 'Unknown',
      partner: booking.partner?.companyName ?? 'Direct',
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      amount: `KES ${Number(booking.totalAmount).toLocaleString()}`,
      date: booking.createdAt ? new Date(booking.createdAt).toISOString() : new Date().toISOString(),
    }));
  } catch (error) {
    console.error('[AdminBookingsService] getAdminBookings error:', error);
    return [];
  }
}
