'use client';

import { useState } from 'react';
import type { Departure } from './types';
import { getDepartureStatusColor } from './helpers';
import { CapacityBar } from './capacity-bar';
import { BookingRow } from './booking-row';

interface DepartureCardProps {
  departure: Departure;
}

export function DepartureCard({ departure }: DepartureCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-stroke bg-white shadow-1 rounded-lg overflow-hidden hover:shadow-2 transition-shadow">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base font-bold text-dark tabular-nums">{departure.time}</span>
              <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded ${getDepartureStatusColor(departure.status)}`}>
                {departure.status}
              </span>
            </div>
            <h4 className="text-sm font-bold text-dark truncate">{departure.experience}</h4>
            <p className="text-xs text-dark-5 mt-0.5">{departure.route}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-dark-6 mb-3">
          <span className="font-medium text-dark">{departure.vessel}</span>
          {departure.vesselType && (
            <>
              <span className="text-stroke">·</span>
              <span>{departure.vesselType.replace(/_/g, ' ').toLowerCase()}</span>
            </>
          )}
        </div>

        <CapacityBar booked={departure.bookedSeats} total={departure.totalCapacity} />

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-stroke">
          <span className="text-xs text-dark-5">
            {departure.bookingCount} booking{departure.bookingCount !== 1 ? 's' : ''}
          </span>
          {departure.bookingCount > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs font-medium text-primary hover:text-primary-deep transition-colors"
              aria-expanded={expanded}
            >
              {expanded ? 'Hide' : 'View'}
            </button>
          )}
        </div>
      </div>

      {expanded && departure.bookingCount > 0 && (
        <div className="border-t border-stroke bg-gray-50/50 px-4 sm:px-5 py-3">
          <div className="space-y-0">
            {departure.bookings.map((booking) => (
              <BookingRow key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
