export type Booking = {
  id: string;
  reference: string;
  status: string;
  paymentStatus: string;
  totalGuests: number;
  totalAmount: string;
  currency: string;
  source: string;
  specialRequests: string | null;
  createdAt: string;
  partner: { companyName: string; contact: string | null; email: string | null } | null;
  guest: { name: string; email: string | null; phone: string | null } | null;
};

export type Departure = {
  id: string;
  time: string;
  experience: string;
  route: string;
  vessel: string;
  vesselType: string | null;
  totalCapacity: number;
  bookedSeats: number;
  availableCapacity: number;
  onlineCapacity: number;
  onlineBookedSeats: number;
  onlineAvailableCapacity: number;
  status: string;
  bookingCount: number;
  bookings: Booking[];
};

export type Voyage = {
  id: string;
  voyageNumber: string;
  status: string;
  vessel: string;
  departureId: string | null;
  readinessPassed: boolean;
};

export type CalendarDay = {
  date: string;
  isBlocked: boolean;
  blockedReason?: string;
  departureCount: number;
  totalCapacity: number;
  totalBooked: number;
  totalBookings: number;
  departures: Departure[];
  voyages: Voyage[];
  voyageCount: number;
};

export type CalendarData = {
  dailySummary: CalendarDay[];
  blockedDates: Array<{ date: string; reason: string; isRecurring?: boolean }>;
};

export type WaterTaxiScheduleProps = {
  data: CalendarData;
};

export type OccupancyState = {
  pct: number;
  label: string;
  color: string;
  bg: string;
};
