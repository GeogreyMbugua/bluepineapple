'use client';

import type { Booking } from './types';
import { PaymentBadge } from './payment-badge';

interface BookingRowProps {
  booking: Booking;
}

export function BookingRow({ booking }: BookingRowProps) {
  const displayName = booking.guest?.name || booking.partner?.companyName || 'Direct';
  return (
    <div className="flex items-center justify-between py-2 first:pt-0 last:pb-0 border-b border-stroke last:border-0">
      <div>
        <p className="text-sm font-medium text-dark">{booking.reference}</p>
        <p className="text-xs text-dark-6">{displayName}</p>
        {booking.specialRequests && (
          <p className="text-xs text-dark-5 mt-0.5 italic">{`"${booking.specialRequests}"`}</p>
        )}
      </div>
      <div className="text-right">
        <p className="text-sm text-dark">
          {booking.totalGuests} guest{booking.totalGuests !== 1 ? 's' : ''}
        </p>
        <PaymentBadge status={booking.paymentStatus} />
      </div>
    </div>
  );
}
