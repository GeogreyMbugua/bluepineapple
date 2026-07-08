export interface BookingCreatedEvent {
  bookingId: string;
  bookingReference: string;
  departureId: string;
  partnerId: string;
  guestId?: string;
  totalGuests: number;
  status: string;
}

export interface BookingCancelledEvent {
  bookingId: string;
  bookingReference: string;
  departureId: string;
  reason?: string;
}

export interface BookingCompletedEvent {
  bookingId: string;
  bookingReference: string;
  partnerId: string;
}

export interface BookingStatusChangedEvent {
  bookingId: string;
  oldStatus: string;
  newStatus: string;
}

export interface BookingConfirmedEvent {
  bookingId: string;
  bookingReference: string;
}
