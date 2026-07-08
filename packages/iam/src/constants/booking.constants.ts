export const BOOKING_STATUS = {
  PENDING: "PENDING" as const,
  CONFIRMED: "CONFIRMED" as const,
  CANCELLED: "CANCELLED" as const,
  COMPLETED: "COMPLETED" as const,
  NO_SHOW: "NO_SHOW" as const,
} as const;

export type BookingStatusValue = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

export const BOOKING_TERMINAL_STATUSES: string[] = [
  BOOKING_STATUS.CANCELLED,
  BOOKING_STATUS.COMPLETED,
  BOOKING_STATUS.NO_SHOW,
];

export const BOOKING_CANCELLABLE_STATUSES: string[] = [
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.CONFIRMED,
];

export const BOOKING_SOURCE = {
  PARTNER: "PARTNER" as const,
  DIRECT: "DIRECT" as const,
  ADMIN: "ADMIN" as const,
  HOTEL: "HOTEL" as const,
  CORPORATE: "CORPORATE" as const,
} as const;

export type BookingSourceValue = typeof BOOKING_SOURCE[keyof typeof BOOKING_SOURCE];
