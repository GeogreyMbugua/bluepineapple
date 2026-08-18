'use client';

import { getOccupancyState } from './helpers';

interface CapacityBarProps {
  booked: number;
  total: number;
}

export function CapacityBar({ booked, total }: CapacityBarProps) {
  const state = getOccupancyState(booked, total);
  const pct = total > 0 ? (booked / total) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className={`font-medium ${state.color}`}>{state.label}</span>
        <span className="text-dark-5">{Math.round(pct)}% occupied</span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${state.bg} transition-all duration-300`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}
