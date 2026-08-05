'use client';

import { useEffect } from 'react';

const CHANNEL_NAME = 'blue-pineapple-notifications';

export function useBookingNotifications(onNewBooking?: () => void) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const channel = new BroadcastChannel(CHANNEL_NAME);

    channel.onmessage = (event: MessageEvent) => {
      if (event.data?.type === 'NEW_BOOKING') {
        onNewBooking?.();
      }
    };

    return () => {
      channel.close();
    };
  }, [onNewBooking]);
}

export function notifyNewBooking(booking: { id: string; bookingReference: string; partnerName: string; totalGuests: number; totalAmount: number }) {
  if (typeof window === 'undefined') return;

  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage({
    type: 'NEW_BOOKING',
    payload: booking,
  });
  channel.close();
}
