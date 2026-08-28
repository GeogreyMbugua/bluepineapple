'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WaterTaxiSchedule } from '@/components/admin/water-taxi-schedule';
import type { CalendarData } from '@/components/admin/water-taxi-schedule';

type Experience = {
  id: string;
  name: string;
  slug: string;
};

export default function AdminOperationsPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [selectedExperience, setSelectedExperience] = useState('fort-jesus');
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExperiences() {
      try {
        const res = await fetch('/api/admin/experiences');
        if (res.ok) {
          const data = await res.json();
          setExperiences(data.data ?? []);
        }
      } catch {
        // ignore
      }
    }
    loadExperiences();
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0] ?? '';
        const url = new URL('/api/admin/trips/calendar', window.location.origin);
        url.searchParams.set('experienceSlug', selectedExperience);
        url.searchParams.set('startDate', today);
        url.searchParams.set('endDate', today);

        const res = await fetch(url.toString(), { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          setCalendarData(json.data as CalendarData);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedExperience]);

  const todaySummary = calendarData?.dailySummary[0];
  const todayDepartures = todaySummary?.departures ?? [];
  const todayBlockedDates = calendarData?.blockedDates ?? [];

  const todayBookings = todayDepartures.reduce(
    (sum, d) => sum + d.bookedSeats,
    0,
  );
  const totalCapacity = todayDepartures.reduce(
    (sum, d) => sum + d.totalCapacity,
    0,
  );
  const availableSeats = totalCapacity - todayBookings;
  const occupancyPct = totalCapacity > 0 ? Math.round((todayBookings / totalCapacity) * 100) : 0;

  const manifest = todayDepartures.flatMap((departure) =>
    departure.bookings
      .filter((b) => b.status === 'CONFIRMED')
      .map((booking) => ({
        departureTime: departure.time,
        reference: booking.reference,
        name: booking.guest?.name ?? booking.partner?.companyName ?? 'Direct',
        guests: booking.totalGuests,
        amount: Number(booking.totalAmount),
        currency: booking.currency,
        source: booking.source,
        specialRequests: booking.specialRequests,
      })),
  );

  const todayRevenue = manifest.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  const primaryDeparture = todayDepartures[0];
  const vesselName = primaryDeparture?.vessel ?? 'Setting Sons';
  const vesselType = primaryDeparture?.vesselType ?? 'CATAMARAN_LUXURY';

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark sm:text-3xl">Operations</h1>
          <p className="mt-1 text-xs text-dark-6 sm:text-sm">
            Fleet, bookings, and voyage control center
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label
            htmlFor="experience-select"
            className="text-xs font-medium text-dark-6 sm:text-sm"
          >
            Experience:
          </label>
          <select
            id="experience-select"
            value={selectedExperience}
            onChange={(e) => setSelectedExperience(e.target.value)}
            className="rounded-lg border border-stroke bg-white px-2.5 py-1.5 text-xs text-dark focus:border-primary focus:outline-none sm:text-sm sm:px-3"
          >
            {experiences.map((exp) => (
              <option key={exp.id} value={exp.slug}>
                {exp.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fleet Status */}
      <div className="border border-stroke bg-white shadow-1">
        <div className="border-b border-stroke border-l-[3px] border-l-primary px-4 py-4 sm:px-6 sm:py-5">
          <h2 className="text-lg font-bold text-dark sm:text-xl">Vessel Status — {vesselName}</h2>
          <p className="mt-1 text-xs text-dark-6 sm:text-sm">
            {vesselType.replace(/_/g, ' ').toLowerCase()} · capacity {totalCapacity} seats
          </p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-stroke p-3 sm:p-4">
              <p className="text-xs text-dark-6 sm:text-sm">Occupancy</p>
              <p className="text-xl font-bold text-dark sm:text-2xl">{occupancyPct}%</p>
              <p className="text-xs text-dark-5">
                {todayBookings} / {totalCapacity} seats booked
              </p>
            </div>
            <div className="rounded-lg border border-stroke p-3 sm:p-4">
              <p className="text-xs text-dark-6 sm:text-sm">Available Seats</p>
              <p className="text-xl font-bold text-dark sm:text-2xl">{availableSeats}</p>
              <p className="text-xs text-dark-5">Online booking limit: 20</p>
            </div>
            <div className="rounded-lg border border-stroke p-3 sm:p-4">
              <p className="text-xs text-dark-6 sm:text-sm">Today&apos;s Revenue</p>
              <p className="text-xl font-bold text-dark sm:text-2xl">
                KES {todayRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-dark-5">{manifest.length} confirmed booking{manifest.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Passenger Manifest */}
      {manifest.length > 0 && (
        <div className="border border-stroke bg-white shadow-1">
          <div className="border-b border-stroke border-l-[3px] border-l-primary px-4 py-4 sm:px-6 sm:py-5">
            <h2 className="text-lg font-bold text-dark sm:text-xl">Passenger Manifest</h2>
            <p className="mt-1 text-xs text-dark-6 sm:text-sm">Confirmed bookings for today</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 text-dark-6">
                <tr>
                  <th className="px-3 py-2 font-medium sm:px-6 sm:py-3">Departure</th>
                  <th className="px-3 py-2 font-medium sm:px-6 sm:py-3">Reference</th>
                  <th className="px-3 py-2 font-medium sm:px-6 sm:py-3">Passenger / Party</th>
                  <th className="px-3 py-2 font-medium sm:px-6 sm:py-3">Guests</th>
                  <th className="px-3 py-2 font-medium sm:px-6 sm:py-3">Amount</th>
                  <th className="px-3 py-2 font-medium sm:px-6 sm:py-3">Source</th>
                  <th className="px-3 py-2 font-medium sm:px-6 sm:py-3">Requests</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke">
                {manifest.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-dark sm:px-6 sm:py-3">{item.departureTime}</td>
                    <td className="px-3 py-2 text-dark sm:px-6 sm:py-3">{item.reference}</td>
                    <td className="px-3 py-2 text-dark sm:px-6 sm:py-3">{item.name}</td>
                    <td className="px-3 py-2 text-dark sm:px-6 sm:py-3">{item.guests}</td>
                    <td className="px-3 py-2 text-dark sm:px-6 sm:py-3">{item.currency} {item.amount.toLocaleString()}</td>
                    <td className="px-3 py-2 text-dark sm:px-6 sm:py-3">{item.source}</td>
                    <td className="px-3 py-2 text-dark-5 italic sm:px-6 sm:py-3">
                      {item.specialRequests ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="border border-stroke bg-white shadow-1">
        <div className="border-b border-stroke border-l-[3px] border-l-primary px-4 py-4 sm:px-6 sm:py-5">
          <h2 className="text-lg font-bold text-dark sm:text-xl">Coastal Experiences</h2>
          <p className="mt-1 text-xs text-dark-6 sm:text-sm">Departures, availability and daily operations</p>
        </div>
        <div className="p-4 sm:p-6">
          {loading ? (
            <p className="text-sm text-dark-5">Loading calendar...</p>
          ) : calendarData ? (
            <WaterTaxiSchedule data={calendarData} />
          ) : (
            <p className="text-sm text-dark-5">No data available.</p>
          )}
        </div>
      </div>

      {todayBlockedDates.length > 0 && (
        <div className="border border-stroke bg-white shadow-1">
          <div className="border-b border-stroke border-l-[3px] border-l-red px-4 py-4 sm:px-6 sm:py-5">
            <h2 className="text-lg font-bold text-dark sm:text-xl">
              Upcoming Blocked Dates
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-2">
              {todayBlockedDates.map((dateBlock, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs sm:text-sm"
                >
                  <span className="text-dark">
                    {new Date(dateBlock.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                    {dateBlock.isRecurring && (
                      <span className="ml-2 text-xs font-medium px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700">
                        Recurring
                      </span>
                    )}
                  </span>
                  <span className="text-dark-6">{dateBlock.reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="border border-stroke bg-white shadow-1">
        <div className="border-b border-stroke border-l-[3px] border-l-primary px-4 py-4 sm:px-6 sm:py-5">
          <h2 className="text-lg font-bold text-dark sm:text-xl">Operations</h2>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href="/admin/blocked-dates"
              className="block p-3 border border-stroke rounded-lg hover:bg-muted transition-colors sm:p-4"
            >
              <span className="font-medium text-dark text-sm sm:text-base">Blocked Dates</span>
              <p className="text-xs text-dark-6 mt-1 sm:text-sm">
                Manage dates when boats are unavailable
              </p>
            </Link>
            <Link
              href="/admin/bookings"
              className="block p-3 border border-stroke rounded-lg hover:bg-muted transition-colors sm:p-4"
            >
              <span className="font-medium text-dark text-sm sm:text-base">Bookings</span>
              <p className="text-xs text-dark-6 mt-1 sm:text-sm">
                View and manage all bookings
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
