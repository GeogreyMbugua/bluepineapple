import { format, addDays, subDays, isSameDay, isToday } from 'date-fns';
import type { CalendarDay, OccupancyState } from './types';

export const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

export function getOccupancyState(booked: number, capacity: number): OccupancyState {
  if (capacity === 0) return { pct: 0, label: 'No capacity', color: 'text-dark-5', bg: 'bg-gray-100' };
  const pct = Math.round((booked / capacity) * 100);
  if (pct >= 100) return { pct: 100, label: 'FULL', color: 'text-red', bg: 'bg-red' };
  if (pct >= 95) return { pct, label: `${100 - pct} left`, color: 'text-red', bg: 'bg-red' };
  if (pct >= 80) return { pct, label: `${capacity - booked} left`, color: 'text-green', bg: 'bg-green' };
  if (pct >= 50) return { pct, label: `${capacity - booked} left`, color: 'text-orange', bg: 'bg-orange' };
  return { pct, label: `${capacity - booked} left`, color: 'text-yellow-dark', bg: 'bg-yellow-dark' };
}

export function getDepartureStatusColor(status: string): string {
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

export function getVoyageStatusColor(status: string): string {
  switch (status) {
    case 'PLANNED':
      return 'bg-gray-100 text-gray-700';
    case 'READY':
      return 'bg-blue-100 text-blue-700';
    case 'BOARDING':
      return 'bg-yellow-100 text-yellow-700';
    case 'DEPARTED':
      return 'bg-green-100 text-green-700';
    case 'ARRIVED':
      return 'bg-green-100 text-green-700';
    case 'COMPLETED':
      return 'bg-gray-100 text-gray-700';
    case 'CANCELLED':
      return 'bg-red-100 text-red-700';
    case 'ABORTED':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

export function cn(...inputs: ReadonlyArray<string | boolean | null | undefined>): string {
  return inputs.filter(Boolean).join(' ');
}

export function getVisibleDates(today: Date): Date[] {
  const dates: Date[] = [];
  let current = subDays(today, 3);
  for (let i = 0; i < 15; i++) {
    dates.push(current);
    current = addDays(current, 1);
  }
  return dates;
}

export function getDateInfo(
  date: Date,
  summaryMap: Map<string, CalendarDay>,
  blockedMap: Map<string, string>,
  selectedDate: Date
) {
  const dateStr = format(date, 'yyyy-MM-dd');
  const dayData = summaryMap.get(dateStr);
  const isBlockedDate = blockedMap.has(dateStr);
  const isSelected = isSameDay(date, selectedDate);
  const isTodayDate = isToday(date);
  const hasActivity = dayData && (dayData.departureCount > 0 || dayData.voyageCount > 0);
  const occupancyState = dayData && dayData.totalCapacity > 0
    ? getOccupancyState(dayData.totalBooked, dayData.totalCapacity)
    : null;

  return { dateStr, dayData, isBlockedDate, isSelected, isTodayDate, hasActivity, occupancyState };
}
