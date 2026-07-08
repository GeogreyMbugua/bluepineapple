import type { Booking } from "@prisma/client";

export interface GuestData {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  idNumber?: string | null;
  nationality?: string | null;
  country?: string | null;
  dateOfBirth?: Date | null;
  specialRequests?: string | null;
  notes?: string | null;
  marketingOptIn: boolean;
  totalVisits: number;
  firstVisitAt?: Date | null;
  lastVisitAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GuestWithHistory extends GuestData {
  bookings: Booking[];
}

export interface GuestResolveInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}
