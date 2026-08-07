'use client';

import { useState, useEffect } from 'react';
import { getAdminTripCalendar } from '@/lib/services/admin-dashboard.service';
import Link from 'next/link';
import {
  CalendarIcon,
  ShipIcon,
  UserIcon,
  ClockIcon,
  DollarSignIcon,
} from '@/components/admin/icons';
import { WaterTaxiSchedule } from '@/components/admin/water-taxi-schedule';
import type { CalendarData } from '@/components/admin/water-taxi-schedule';

export const dynamic = 'force-dynamic';

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
        const calendar = await getAdminTripCalendar(
          selectedExperience,
          today,
          today,
        );
        setCalendarData(calendar as unknown as CalendarData);
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
  const upcomingBlocks = todayBlockedDates.length;

  // Build passenger manifest from confirmed bookings across today's departures
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

  // Vessel info from the first departure (all today's departures share the same vessel)
  const primaryDeparture = todayDepartures[0];
  const vesselName = primaryDeparture?.vessel ?? 'Setting Sons';
  const vesselType = primaryDeparture?.vesselType ?? 'CATAMARAN_LUXURY';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark">Operations</h1>
          <p className="mt-1 text-dark-6">
            Fleet, bookings, and voyage control center
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label
            htmlFor="experience-select"
            className="text-sm font-medium text-dark-6"
          >
            Experience:
          </label>
          <select
            id="experience-select"
            value={selectedExperience}
            onChange={(e) => setSelectedExperience(e.target.value)}
            className="rounded-lg border border-stroke bg-white px-3 py-1.5 text-sm text-dark focus:border-primary focus:outline-none"
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
        <div className="border-b border-stroke border-l-[3px] border-l-primary px-6 py-5">
          <h2 className="text-xl font-bold text-dark">Vessel Status — {vesselName}</h2>
          <p className="mt-1 text-sm text-dark-6">
            {vesselType.replace(/_/g, ' ').toLowerCase()} · capacity {totalCapacity} seats
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-stroke p-4">
              <p className="text-sm text-dark-6">Occupancy</p>
              <p className="text-2xl font-bold text-dark">{occupancyPct}%</p>
              <p className="text-xs text-dark-5">
                {todayBookings} / {totalCapacity} seats booked
              </p>
            </div>
            <div className="rounded-lg border border-stroke p-4">
              <p className="text-sm text-dark-6">Available Seats</p>
              <p className="text-2xl font-bold text-dark">{availableSeats}</p>
              <p className="text-xs text-dark-5">Online booking limit: 20</p>
            </div>
            <div className="rounded-lg border border-stroke p-4">
              <p className="text-sm text-dark-6">Today's Revenue</p>
              <p className="text-2xl font-bold text-dark">
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
          <div className="border-b border-stroke border-l-[3px] border-l-primary px-6 py-5">
            <h2 className="text-xl font-bold text-dark">Passenger Manifest</h2>
            <p className="mt-1 text-sm text-dark-6">Confirmed bookings for today</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-dark-6">
                <tr>
                  <th className="px-6 py-3 font-medium">Departure</th>
                  <th className="px-6 py-3 font-medium">Reference</th>
                  <th className="px-6 py-3 font-medium">Passenger / Party</th>
                  <th className="px-6 py-3 font-medium">Guests</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Source</th>
                  <th className="px-6 py-3 font-medium">Requests</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke">
                {manifest.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-dark">{item.departureTime}</td>
                    <td className="px-6 py-3 text-dark">{item.reference}</td>
                    <td className="px-6 py-3 text-dark">{item.name}</td>
                    <td className="px-6 py-3 text-dark">{item.guests}</td>
                    <td className="px-6 py-3 text-dark">{item.currency} {item.amount.toLocaleString()}</td>
                    <td className="px-6 py-3 text-dark">{item.source}</td>
                    <td className="px-6 py-3 text-dark-5 italic">
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
        <div className="border-b border-stroke border-l-[3px] border-l-primary px-6 py-5">
          <h2 className="text-xl font-bold text-dark">Calendar</h2>
        </div>
        <div className="p-6">
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
          <div className="border-b border-stroke border-l-[3px] border-l-red px-6 py-5">
            <h2 className="text-xl font-bold text-dark">
              Upcoming Blocked Dates
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              {todayBlockedDates.map((dateBlock, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-sm"
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
        <div className="border-b border-stroke border-l-[3px] border-l-primary px-6 py-5">
          <h2 className="text-xl font-bold text-dark">Operations</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href="/admin/blocked-dates"
              className="block p-4 border border-stroke rounded-lg hover:bg-muted transition-colors"
            >
              <span className="font-medium text-dark">Blocked Dates</span>
              <p className="text-sm text-dark-6 mt-1">
                Manage dates when boats are unavailable
              </p>
            </Link>
            <Link
              href="/admin/bookings"
              className="block p-4 border border-stroke rounded-lg hover:bg-muted transition-colors"
            >
              <span className="font-medium text-dark">Bookings</span>
              <p className="text-sm text-dark-6 mt-1">
                View and manage all bookings
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
