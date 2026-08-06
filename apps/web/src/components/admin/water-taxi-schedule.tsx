'use client';

import { useMemo, useState } from 'react';
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
  date: string;
  time: string;
  experience: string;
  experienceCategory: string | null;
  durationMinutes: number | null;
  defaultPrice: string | null;
  currency: string;
  route: string;
  routeCode: string | null;
  stops: Array<{ name: string; code: string }>;
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
  departures: Departure[];
  blockedDates: Array<{ date: string; reason: string }>;
};

type WaterTaxiScheduleProps = {
  data: CalendarData;
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
        isPaid
          ? 'bg-green-100 text-green-700'
          : 'bg-yellow-100 text-yellow-700'
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
  const today = useMemo(() => new Date().toISOString().split('T')[0] ?? '', []);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const todayStr = today;
    const hasToday = data.dailySummary.some((d) => d.date === todayStr);
    return hasToday ? todayStr : data.dailySummary[0]?.date ?? '';
  });

  const summaryMap = useMemo(
    () => new Map(data.dailySummary.map((d) => [d.date, d])),
    [data.dailySummary]
  );
  const blockedMap = useMemo(
    () => new Map(data.blockedDates.map((d) => [d.date, d.reason])),
    [data.blockedDates]
  );

  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentMonth.year, currentMonth.month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days: Array<{ day: number; dateStr: string | null; isCurrentMonth: boolean }> = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: 0, dateStr: null, isCurrentMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ day, dateStr, isCurrentMonth: true });
    }
    return days;
  }, [currentMonth, daysInMonth, firstDayOfWeek]);

  const selectedDayData = selectedDate ? summaryMap.get(selectedDate) : null;
  const isBlocked = blockedMap.has(selectedDate);
  const blockedReason = blockedMap.get(selectedDate);

  const prevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" type="button">
          <ChevronLeftIcon className="size-5 text-dark-6" />
        </button>
        <h3 className="text-lg font-semibold text-dark">
          {MONTHS[currentMonth.month]} {currentMonth.year}
        </h3>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" type="button">
          <ChevronRightIcon className="size-5 text-dark-6" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
        {WEEKDAYS.map((day) => (
          <div key={day} className="bg-gray-50 px-2 py-2 text-center">
            <span className="text-xs font-bold text-dark-6 uppercase tracking-wider">{day}</span>
          </div>
        ))}
        {calendarDays.map((item, index) => {
          if (!item.isCurrentMonth) {
            return (
              <div key={index} className="bg-gray-50/60 p-2 min-h-[60px]">
                <span className="text-sm text-gray-400">{item.day}</span>
              </div>
            );
          }

          const summary = summaryMap.get(item.dateStr!);
          const isBlockedDay = blockedMap.has(item.dateStr!);
          const isToday = item.dateStr === today;
          const isSelected = item.dateStr === selectedDate;

          const baseClasses = 'p-2 min-h-[60px] cursor-pointer transition-colors relative';
          let bgClass = 'bg-white';
          if (isBlockedDay) {
            bgClass = 'bg-red-50/80';
          } else if (!summary) {
            bgClass = 'bg-gray-50/40';
          } else if (summary.totalBooked >= (summary.totalCapacity || 1) * 0.8) {
            bgClass = 'bg-green-50/80';
          } else if (summary.totalBooked >= (summary.totalCapacity || 1) * 0.5) {
            bgClass = 'bg-blue-50/70';
          } else if (summary.totalBooked > 0) {
            bgClass = 'bg-yellow-50/70';
          }

          return (
            <div
              key={index}
              className={`${baseClasses} ${bgClass} ${isSelected ? 'ring-2 ring-inset ring-primary-deep' : ''} ${isToday ? 'ring-2 ring-inset ring-primary' : ''}`}
              onClick={() => setSelectedDate(item.dateStr!)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-bold ${isToday ? 'text-primary-deep' : 'text-dark'}`}>
                  {item.day}
                </span>
                {isToday && (
                  <span className="text-[10px] font-bold text-primary-deep bg-primary/10 px-1 py-0.5 rounded">Today</span>
                )}
              </div>
              {isBlockedDay && (
                <span className="absolute top-1 right-1 text-[8px] font-bold text-red bg-red-100 px-1 rounded">Blocked</span>
              )}
              {summary && !isBlockedDay && summary.departureCount > 0 && (
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-dark">{summary.departureCount} trip{summary.departureCount !== 1 ? 's' : ''}</span>
                  <span className={`font-bold ${getOccupancyColor(summary.totalBooked, summary.totalCapacity)}`}>
                    {summary.totalBooked}/{summary.totalCapacity}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="border border-stroke bg-white shadow-1 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-bold text-dark mb-4">
          {selectedDate
            ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })
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
