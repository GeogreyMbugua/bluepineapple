'use client';

import { useMemo, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import 'react-day-picker/style.css';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/admin/icons';

type Booking = {
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

type Departure = {
  id: string;
  time: string;
  experience: string;
  route: string;
  vessel: string;
  vesselType: string | null;
  totalCapacity: number;
  bookedSeats: number;
  availableCapacity: number;
  status: string;
  bookingCount: number;
  bookings: Booking[];
};

type CalendarData = {
  dailySummary: Array<{
    date: string;
    isBlocked: boolean;
    blockedReason?: string;
    departureCount: number;
    totalCapacity: number;
    totalBooked: number;
    totalBookings: number;
    departures: Departure[];
  }>;
  blockedDates: Array<{ date: string; reason: string }>;
};

type WaterTaxiScheduleProps = {
  data: CalendarData;
};

function getOccupancyColor(booked: number, capacity: number): string {
  if (capacity === 0) return 'text-gray-400';
  const pct = booked / capacity;
  if (pct >= 0.8) return 'text-green';
  if (pct >= 0.5) return 'text-orange';
  if (pct > 0) return 'text-yellow-dark';
  return 'text-gray-400';
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'SCHEDULED':
      return 'bg-blue-100 text-blue-700';
    case 'BOARDING':
      return 'bg-yellow-100 text-yellow-700';
    case 'DEPARTED':
      return 'bg-green-100 text-green-700';
    case 'ARRIVED':
      return 'bg-green-100 text-green-700';
    case 'CANCELLED':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

function PaymentBadge({ status }: { status: string }) {
  const isPaid = status === 'PAID';
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded ${
        isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
      }`}
    >
      {status}
    </span>
  );
}

function BookingRow({ booking }: { booking: Booking }) {
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

function DepartureCard({ departure }: { departure: Departure }) {
  const occupancy = Math.round((departure.bookedSeats / Math.max(1, departure.totalCapacity)) * 100);
  return (
    <div className="border border-stroke bg-white shadow-1 rounded-lg overflow-hidden">
      <div className="border-b border-stroke px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-dark">{departure.time}</span>
            <span className={`ml-2 inline-block px-1.5 py-0.5 text-[10px] font-bold rounded ${getStatusColor(departure.status)}`}>
              {departure.status}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-dark">{departure.vessel}</p>
            <p className={`text-xs font-bold ${getOccupancyColor(departure.bookedSeats, departure.totalCapacity)}`}>
              {departure.bookedSeats}/{departure.totalCapacity} seats ({occupancy}%)
            </p>
          </div>
        </div>
      </div>

      {departure.bookingCount > 0 && (
        <div className="px-4 py-3">
          <div className="space-y-1">
            {departure.bookings.map((booking) => (
              <BookingRow key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}

      {departure.bookingCount === 0 && (
        <div className="px-4 py-6 text-center text-dark-5 text-sm">
          No bookings for this departure.
        </div>
      )}
    </div>
  );
}

export function WaterTaxiSchedule({ data }: WaterTaxiScheduleProps) {
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);

  const summaryMap = useMemo(
    () => new Map(data.dailySummary.map((d) => [d.date, d])),
    [data.dailySummary],
  );
  const blockedMap = useMemo(
    () => new Map(data.blockedDates.map((d) => [d.date, d.reason])),
    [data.blockedDates],
  );

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const selectedDayData = selectedDateStr ? summaryMap.get(selectedDateStr) : null;
  const isBlocked = selectedDateStr ? blockedMap.has(selectedDateStr) : false;
  const blockedReason = selectedDateStr ? blockedMap.get(selectedDateStr) : undefined;

  const tripDates = useMemo(
    () => new Set(data.dailySummary.map((d) => new Date(d.date))),
    [data.dailySummary],
  );

  return (
    <div className="space-y-4">
      <div className="rdp-wall">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          showOutsideDays={false}
          modifiers={{
            hasTrips: Array.from(tripDates),
            blocked: Array.from(blockedMap.keys(), (d) => new Date(d)),
          }}
          components={{
            PreviousMonthButton: (props) => (
              <button
                {...props}
                type="button"
                aria-label="Previous month"
                className="rdp-nav-button flex items-center justify-center h-8 w-8 rounded-lg bg-gray-100 text-dark-6 hover:bg-gray-200 transition-colors"
              >
                <ChevronLeftIcon className="size-5" />
              </button>
            ),
            NextMonthButton: (props) => (
              <button
                {...props}
                type="button"
                aria-label="Next month"
                className="rdp-nav-button flex items-center justify-center h-8 w-8 rounded-lg bg-gray-100 text-dark-6 hover:bg-gray-200 transition-colors"
              >
                <ChevronRightIcon className="size-5" />
              </button>
            ),
          }}
          classNames={{
            months: 'rdp-months',
            month: 'rdp-month',
            month_grid: 'rdp-month-grid',
            day: 'rdp-day',
            day_button: 'rdp-day-button',
            today: 'rdp-day_today',
            selected: 'rdp-day_selected',
            weekdays: 'rdp-weekdays',
            weekday: 'rdp-weekday',
            week: 'rdp-week',
            weeks: 'rdp-weeks',
            nav: 'rdp-nav',
            month_caption: 'rdp-month-caption',
          }}
        />
        <style jsx>{`
          :global(.rdp-day.has-trips::after) {
            content: '';
            position: absolute;
            bottom: 2px;
            left: 50%;
            transform: translateX(-50%);
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #4FA8C9;
          }
          :global(.rdp-day.blocked) {
            background-color: #fef2f2;
            color: #dc2626;
          }
        `}</style>
      </div>

      <div className="border border-stroke bg-white shadow-1 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-bold text-dark mb-4">
          {selectedDate
            ? format(selectedDate, 'EEEE, MMMM d, yyyy')
            : 'Select a date'}
        </h3>

        {isBlocked && blockedReason && (
          <div className="border border-red bg-red-light-5 px-4 py-3 text-sm text-red rounded-lg">
            This date is blocked: {blockedReason}
          </div>
        )}

        {!isBlocked && selectedDayData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-dark-6">
              <span>
                {selectedDayData.departureCount} trip{selectedDayData.departureCount !== 1 ? 's' : ''} · {selectedDayData.totalBookings} booking{selectedDayData.totalBookings !== 1 ? 's' : ''}
              </span>
              <span className={`font-medium ${getOccupancyColor(selectedDayData.totalBooked, selectedDayData.totalCapacity)}`}>
                {selectedDayData.totalBooked}/{selectedDayData.totalCapacity} seats booked
              </span>
            </div>

            <div className="space-y-3">
              {selectedDayData.departures.map((dep) => (
                <DepartureCard key={dep.id} departure={dep} />
              ))}
            </div>
          </div>
        )}

        {!selectedDayData && !isBlocked && (
          <p className="text-sm text-dark-5">No departures scheduled for this date.</p>
        )}
      </div>
    </div>
  );
}

export { type CalendarData };
