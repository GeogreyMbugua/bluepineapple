import type {
  Guest,
  BookingGuest,
  BookingStatus,
  BookingSource,
} from "@prisma/client";

export interface BookingData {
  id: string;
  bookingReference: string;
  departureId: string;
  partnerId: string;
  guestId?: string | null;
  totalGuests: number;
  totalAmount: number;
  currency: string;
  status: BookingStatus;
  paymentStatus: string;
  source: BookingSource;
  pickupStopId?: string | null;
  specialRequests?: string | null;
  notes?: string | null;
  cancelledAt?: Date | null;
  cancelledBy?: string | null;
  cancellationReason?: string | null;
  rewardEligible: boolean;
  rewardProcessedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  guest?: Guest;
  departure?: any;
  partner?: any;
}

export interface BookingWithDetails extends BookingData {
  guests: BookingGuest[];
  statusHistory: any[];
}

export interface BookingSearchInput {
  departureId?: string;
  partnerId?: string;
  guestId?: string;
  status?: BookingStatus;
  source?: BookingSource;
  page?: number;
  limit?: number;
}

export interface BookingStatusTransition {
  from: BookingStatus;
  to: BookingStatus;
  allowed: boolean;
}

export interface CreateBookingInput {
  departureId: string;
  partnerId: string;
  guestId?: string;
  guest?: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  totalGuests: number;
  totalAmount: number;
  pickupStopId?: string;
  specialRequests?: string;
  notes?: string;
  idempotencyKey?: string;
  bookingGuests?: {
    fullName: string;
    idNumber?: string;
    phoneNumber?: string;
    isPrimary?: boolean;
  }[];
}

export interface UpdateBookingInput {
  totalGuests?: number;
  totalAmount?: number;
  pickupStopId?: string;
  specialRequests?: string;
  notes?: string;
  status?: BookingStatus;
}

export interface CancelBookingInput {
  reason?: string;
}
