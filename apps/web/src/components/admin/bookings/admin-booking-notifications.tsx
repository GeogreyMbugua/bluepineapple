'use client';

import { useToast } from '@/providers/toast-provider';
import { useBookingNotifications } from '@/hooks/use-booking-notifications';

interface AdminBookingNotificationsProps {
  onNewBooking?: () => void;
}

export function AdminBookingNotifications({ onNewBooking }: AdminBookingNotificationsProps) {
  const { addToast } = useToast();

  useBookingNotifications(() => {
    addToast('New partner booking received!', 'info');
    onNewBooking?.();
  });

  return null;
}
