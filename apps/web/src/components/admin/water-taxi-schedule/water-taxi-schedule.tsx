'use client';

import { useMemo, useState, useCallback } from 'react';
import { format } from 'date-fns';
import type { WaterTaxiScheduleProps } from './types';
import { ExperienceFilter } from './experience-filter';
import { DateNavigation } from './date-navigation';
import { AvailabilityStrip } from './availability-strip';
import { BlockedDateNotice } from './blocked-date-notice';
import { ScheduleContent } from './schedule-content';
import { getVisibleDates } from './helpers';

export function WaterTaxiSchedule({ data }: WaterTaxiScheduleProps) {
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [experienceFilter, setExperienceFilter] = useState<string>('all');

  const summaryMap = useMemo(
    () => new Map(data.dailySummary.map((d) => [d.date, d])),
    [data.dailySummary],
  );

  const blockedMap = useMemo(
    () => new Map(data.blockedDates.map((d) => [d.date, d.reason])),
    [data.blockedDates],
  );

  const experiences = useMemo(() => {
    const set = new Set<string>();
    for (const day of data.dailySummary) {
      for (const dep of day.departures) {
        set.add(dep.experience);
      }
    }
    return Array.from(set).sort();
  }, [data.dailySummary]);

  const visibleDates = useMemo(() => getVisibleDates(today), [today]);

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const selectedDayData = selectedDateStr ? summaryMap.get(selectedDateStr) : null;
  const isBlocked = selectedDateStr ? blockedMap.has(selectedDateStr) : false;
  const blockedReason = selectedDateStr ? blockedMap.get(selectedDateStr) : undefined;

  const filteredDepartures = useMemo(() => {
    if (!selectedDayData) return [];
    if (experienceFilter === 'all') return selectedDayData.departures;
    return selectedDayData.departures.filter((d) => d.experience === experienceFilter);
  }, [selectedDayData, experienceFilter]);

  const filteredVoyages = useMemo(() => {
    if (!selectedDayData) return [];
    if (experienceFilter === 'all') return selectedDayData.voyages;
    return selectedDayData.voyages.filter((v) => {
      const dep = selectedDayData.departures.find((d) => d.id === v.departureId);
      return dep?.experience === experienceFilter;
    });
  }, [selectedDayData, experienceFilter]);

  const navigate = useCallback((direction: 1 | -1) => {
    setSelectedDate((prev) => {
      const base = prev ?? today;
      const next = new Date(base);
      next.setDate(next.getDate() + direction);
      return next;
    });
  }, [today]);

  const goToToday = useCallback(() => {
    setSelectedDate(today);
  }, [today]);

  const handleSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-dark">Coastal Experiences</h2>
          <p className="text-sm text-dark-6 mt-0.5">Manage departures, availability and daily operations</p>
        </div>
        <ExperienceFilter
          value={experienceFilter}
          onChange={setExperienceFilter}
          experiences={experiences}
        />
      </div>

      <DateNavigation
        selectedDate={selectedDate ?? today}
        onPrev={() => navigate(-1)}
        onNext={() => navigate(1)}
        onToday={goToToday}
      />

      <AvailabilityStrip
        dates={visibleDates}
        selectedDate={selectedDate ?? today}
        summaryMap={summaryMap}
        blockedMap={blockedMap}
        onSelect={handleSelect}
      />

      {isBlocked && blockedReason && selectedDate && (
        <BlockedDateNotice reason={blockedReason} />
      )}

      {selectedDate && selectedDayData && !isBlocked && (
        <ScheduleContent
          departures={filteredDepartures}
          voyages={filteredVoyages}
          selectedDate={selectedDate}
        />
      )}

      {selectedDate && !selectedDayData && !isBlocked && (
        <div className="text-center py-10">
          <p className="text-sm text-dark-5">No departures scheduled</p>
          <p className="text-xs text-dark-5 mt-1">
            There are no coastal experiences scheduled for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.
          </p>
        </div>
      )}
    </div>
  );
}
