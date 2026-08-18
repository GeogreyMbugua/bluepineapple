'use client';

import { format } from 'date-fns';
import type { Departure, Voyage } from './types';
import { DepartureCard } from './departure-card';
import { VoyageCard } from './voyage-card';
import { getOccupancyState } from './helpers';

interface ScheduleContentProps {
  departures: Departure[];
  voyages: Voyage[];
  selectedDate: Date;
}

export function ScheduleContent({ departures, voyages, selectedDate }: ScheduleContentProps) {
  const totalBooked = departures.reduce((s, d) => s + d.bookedSeats, 0);
  const totalCapacity = departures.reduce((s, d) => s + d.totalCapacity, 0);
  const occupancy = getOccupancyState(totalBooked, totalCapacity);

  if (departures.length === 0 && voyages.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-dark-5">No departures scheduled</p>
        <p className="text-xs text-dark-5 mt-1">
          There are no coastal experiences scheduled for {format(selectedDate, 'EEEE, MMMM d')}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-dark">
            {format(selectedDate, 'EEEE, MMMM d')}
          </h3>
          <p className="text-xs text-dark-5 mt-0.5">
            {departures.length} departure{departures.length !== 1 ? 's' : ''} · {voyages.length} voyage{voyages.length !== 1 ? 's' : ''} · {occupancy.label}
          </p>
        </div>
        <div className={`text-xs font-bold ${occupancy.color}`}>
          {totalCapacity > 0 ? `${Math.round((totalBooked / totalCapacity) * 100)}%` : '—'} occupied
        </div>
      </div>

      {voyages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-dark-5 uppercase tracking-wider">Voyages</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {voyages.map((voyage) => (
              <VoyageCard key={voyage.id} voyage={voyage} />
            ))}
          </div>
        </div>
      )}

      {departures.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-dark-5 uppercase tracking-wider">Departures</h4>
          <div className="space-y-2">
            {departures.map((dep) => (
              <DepartureCard key={dep.id} departure={dep} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
