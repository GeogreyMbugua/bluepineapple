'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { cn } from './helpers';
import type { CalendarDay } from './types';
import { DAY_NAMES, getDateInfo, getOccupancyState } from './helpers';

interface AvailabilityStripProps {
  dates: Date[];
  selectedDate: Date;
  summaryMap: Map<string, CalendarDay>;
  blockedMap: Map<string, string>;
  onSelect: (date: Date) => void;
}

export function AvailabilityStrip({ dates, selectedDate, summaryMap, blockedMap, onSelect }: AvailabilityStripProps) {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex items-start gap-1.5 sm:gap-2 min-w-max sm:min-w-0">
        {dates.map((date) => {
          const { isBlockedDate, isSelected, isTodayDate, hasActivity, occupancyState, dayData } = getDateInfo(date, summaryMap, blockedMap, selectedDate);
          const isHovered = hoveredDate && format(hoveredDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');

          return (
            <div
              key={date.toISOString()}
              className="relative"
              onMouseEnter={() => setHoveredDate(date)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              <button
                onClick={() => onSelect(date)}
                className={cn(
                  'flex flex-col items-center justify-center rounded-lg border-2 transition-all min-w-[52px] sm:min-w-[64px] py-2 px-1.5',
                  isSelected && 'border-primary bg-primary/5',
                  !isSelected && isBlockedDate && 'border-red bg-red-light-5',
                  !isSelected && !isBlockedDate && isTodayDate && 'border-primary bg-primary/5',
                  !isSelected && !isBlockedDate && !isTodayDate && 'border-transparent hover:border-stroke bg-white'
                )}
                aria-label={`${format(date, 'MMM d')}${hasActivity ? `, ${dayData!.departureCount} departures` : ''}${isBlockedDate ? ', blocked' : ''}`}
                aria-pressed={isSelected}
              >
                <span className="text-[10px] font-medium text-dark-5 mb-1">{DAY_NAMES[date.getDay()]}</span>
                <span className={`text-base font-bold ${isSelected || isTodayDate ? 'text-primary' : 'text-dark'}`}>
                  {format(date, 'd')}
                </span>
                {isBlockedDate ? (
                  <span className="text-[10px] font-medium text-red mt-1">Blocked</span>
                ) : hasActivity && occupancyState ? (
                  <span className={`text-[10px] font-medium ${occupancyState.color} mt-1 truncate max-w-full`}>
                    {occupancyState.pct >= 100 ? 'FULL' : occupancyState.label}
                  </span>
                ) : (
                  <span className="text-[10px] text-dark-5 mt-1">—</span>
                )}
              </button>

              {isHovered && hasActivity && dayData && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 rounded-lg border border-stroke bg-white shadow-2 p-3 pointer-events-none">
                  <div className="text-xs font-bold text-dark mb-2">
                    {format(date, 'EEEE, MMMM d')}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-dark-6">Departures</span>
                      <span className="font-medium text-dark">{dayData.departureCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-dark-6">Voyages</span>
                      <span className="font-medium text-dark">{dayData.voyageCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-dark-6">Bookings</span>
                      <span className="font-medium text-dark">{dayData.totalBookings}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-dark-6">Occupancy</span>
                      <span className={`font-medium ${getOccupancyState(dayData.totalBooked, dayData.totalCapacity).color}`}>
                        {dayData.totalCapacity > 0 ? `${Math.round((dayData.totalBooked / dayData.totalCapacity) * 100)}%` : '—'}
                      </span>
                    </div>
                    {dayData.departures.length > 0 && (
                      <div className="pt-1.5 border-t border-stroke mt-1.5">
                        <p className="text-[10px] font-medium text-dark-5 uppercase tracking-wider mb-1">Experiences</p>
                        <div className="space-y-1">
                          {dayData.departures.slice(0, 3).map((dep) => (
                            <div key={dep.id} className="flex items-center justify-between text-xs">
                              <span className="text-dark truncate pr-2">{dep.time}</span>
                              <span className="text-dark-5 truncate">{dep.experience}</span>
                            </div>
                          ))}
                          {dayData.departures.length > 3 && (
                            <p className="text-[10px] text-dark-5">+{dayData.departures.length - 3} more</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isHovered && isBlockedDate && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-48 rounded-lg border border-red bg-red-light-5 shadow-2 p-3 pointer-events-none">
                  <p className="text-xs font-bold text-red">Blocked</p>
                  <p className="text-[10px] text-red/80 mt-0.5">{blockedMap.get(format(date, 'yyyy-MM-dd'))}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
