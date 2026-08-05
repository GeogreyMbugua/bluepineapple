'use client';

import { useState, useMemo } from 'react';
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

type CalendarProps = {
  data: CalendarData;
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getStatusColor(status: string) {
  switch (status) {
    case 'SCHEDULED': return 'bg-blue-100 text-blue-700';
    case 'BOARDING': return 'bg-yellow-100 text-yellow-700';
    case 'DEPARTED': return 'bg-green-100 text-green-700';
    case 'ARRIVED': return 'bg-green-100 text-green-700';
    case 'CANCELLED': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-600';
  }
}

function getOccupancyColor(booked: number, capacity: number) {
  if (capacity === 0) return 'text-gray-400';
  const pct = booked / capacity;
  if (pct >= 0.8) return 'text-green';
  if (pct >= 0.5) return 'text-yellow-dark';
  if (pct > 0) return 'text-orange';
  return 'text-red';
}

export function FortJesusCalendar({ data }: CalendarProps) {
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const summaryMap = useMemo(() => new Map(data.dailySummary.map((d) => [d.date, d])), [data.dailySummary]);
  const blockedMap = useMemo(() => new Map(data.blockedDates.map((d) => [d.date, d.reason])), [data.blockedDates]);

  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentMonth.year, currentMonth.month, 1).getDay();

  const prevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
    setSelectedDate(null);
  };

  const selectedDayData = selectedDate ? summaryMap.get(selectedDate) : null;
  const filteredDepartures = selectedDayData
    ? selectedDayData.departures.filter((d) => statusFilter === 'ALL' || d.status === statusFilter)
    : [];

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
        {DAYS.map((day) => (
          <div key={day} className="bg-gray-50 px-2 py-2 text-center">
            <span className="text-xs font-bold text-dark-6 uppercase tracking-wider">{day}</span>
          </div>
        ))}
        {calendarDays.map((item, index) => {
          if (!item.isCurrentMonth) {
            return (
              <div key={index} className="bg-gray-50/60 p-2 min-h-[80px]">
                <span className="text-sm text-gray-400">{item.day}</span>
              </div>
            );
          }

          const summary = summaryMap.get(item.dateStr!);
          const blockedReason = blockedMap.get(item.dateStr!);
          const isToday = item.dateStr === today;
          const isSelected = item.dateStr === selectedDate;

          return (
            <div
              key={index}
              className={`p-2 min-h-[80px] cursor-pointer transition-colors ${
                blockedReason
                  ? 'bg-red-50/80'
                  : !summary
                  ? 'bg-gray-50/40'
                  : summary.totalBooked >= summary.totalCapacity * 0.8
                  ? 'bg-green-50/80'
                  : summary.totalBooked >= summary.totalCapacity * 0.5
                  ? 'bg-blue-50/70'
                  : 'bg-white'
              } ${isSelected ? 'ring-2 ring-inset ring-primary-deep' : ''} ${isToday ? 'ring-2 ring-inset ring-primary' : ''}`}
              onClick={() => setSelectedDate(isSelected ? null : item.dateStr!)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-bold ${isToday ? 'text-primary-deep' : 'text-dark'}`}>
                  {item.day}
                </span>
                {isToday && (
                  <span className="text-[10px] font-bold text-primary-deep bg-primary/10 px-1 py-0.5 rounded">Today</span>
                )}
              </div>

              {blockedReason && (
                <div className="mt-1">
                  <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red rounded">Blocked</span>
                </div>
              )}

              {summary && !blockedReason && (
                <div className="mt-1 space-y-0.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-dark">{summary.departureCount} trip{summary.departureCount !== 1 ? 's' : ''}</span>
                    <span className={`font-bold ${getOccupancyColor(summary.totalBooked, summary.totalCapacity)}`}>
                      {summary.totalBooked}/{summary.totalCapacity}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedDayData && !selectedDayData.isBlocked && (
        <div className="border border-stroke bg-white shadow-1 rounded-lg overflow-hidden">
          <div className="border-b border-stroke border-l-[3px] border-l-primary px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-dark">
                  {new Date(selectedDayData.date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
                <p className="text-xs text-dark-6 mt-0.5">
                  {selectedDayData.departureCount} trip{selectedDayData.departureCount !== 1 ? 's' : ''} • {selectedDayData.totalBookings} booking{selectedDayData.totalBookings !== 1 ? 's' : ''} • {selectedDayData.totalBooked}/{selectedDayData.totalCapacity} seats
                </p>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-stroke rounded px-2 py-1 bg-white"
              >
                <option value="ALL">All statuses</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="BOARDING">Boarding</option>
                <option value="DEPARTED">Departed</option>
                <option value="ARRIVED">Arrived</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="divide-y divide-stroke">
            {filteredDepartures.length === 0 ? (
              <div className="px-4 py-6 text-center text-dark-6 text-sm">No departures match this filter.</div>
            ) : (
              filteredDepartures.map((dep) => {
                const occupancy = Math.round((dep.bookedSeats / Math.max(1, dep.totalCapacity)) * 100);
                return (
                  <div key={dep.id} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-dark">{dep.time}</span>
                        <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded ${getStatusColor(dep.status)}`}>
                          {dep.status}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-dark-6">{dep.bookedSeats}/{dep.totalCapacity} seats</span>
                    </div>
                    <p className="text-sm font-semibold text-dark">{dep.experience}</p>
                    <p className="text-xs text-dark-6">
                      {dep.route} • {dep.vessel} • {dep.durationMinutes ? `${dep.durationMinutes / 60}h` : ''}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            occupancy >= 100 ? 'bg-green' :
                            occupancy >= 80 ? 'bg-green' :
                            occupancy >= 50 ? 'bg-yellow' : 'bg-red'
                          }`}
                          style={{ width: `${Math.min(100, occupancy)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-dark-6 w-8 text-right">{occupancy}%</span>
                    </div>
                    {dep.bookingCount > 0 && (
                      <div className="mt-2 space-y-1">
                        {dep.bookings.slice(0, 5).map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between text-xs bg-gray-50 rounded px-2 py-1">
                            <span className="font-medium text-dark">{booking.reference}</span>
                            <span className="text-dark-6">
                              {booking.guest?.name || booking.partner?.companyName || 'Direct'} • {booking.totalGuests} guest{booking.totalGuests !== 1 ? 's' : ''}
                            </span>
                          </div>
                        ))}
                        {dep.bookings.length > 5 && (
                          <p className="text-[10px] text-dark-6 text-center">+{dep.bookings.length - 5} more</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {selectedDayData?.isBlocked && (
        <div className="border border-stroke bg-white shadow-1 rounded-lg overflow-hidden">
          <div className="border-b border-stroke border-l-[3px] border-l-red px-4 py-3">
            <h3 className="text-base font-bold text-dark">
              {new Date(selectedDayData.date + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
            <p className="text-xs text-red mt-0.5 font-medium">Blocked — {selectedDayData.blockedReason || 'No reason provided'}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green" />
          <span className="text-dark-6">High occupancy (≥80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow" />
          <span className="text-dark-6">Medium occupancy (≥50%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red" />
          <span className="text-dark-6">Low / No bookings</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-200 border border-red" />
          <span className="text-dark-6">Blocked</span>
        </div>
      </div>
    </div>
  );
}