'use client';

import { ChevronLeftIcon, ChevronRightIcon } from '@/components/admin/icons';

interface DateNavigationProps {
  selectedDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function DateNavigation({ selectedDate, onPrev, onNext, onToday }: DateNavigationProps) {
  const monthYear = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const fullDate = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={onPrev}
        className="inline-flex items-center justify-center size-8 rounded-lg border border-stroke bg-white text-dark-6 hover:bg-gray-50 transition-colors"
        aria-label="Previous day"
      >
        <ChevronLeftIcon className="size-4" />
      </button>
      <div className="text-center">
        <div className="text-sm font-bold text-dark uppercase tracking-wide">
          {monthYear}
        </div>
        <div className="text-xs text-dark-5 mt-0.5">
          {fullDate}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToday}
          className="hidden sm:inline-flex items-center px-2.5 py-1 text-xs font-medium text-dark-6 border border-stroke rounded-lg hover:bg-gray-50 transition-colors"
        >
          Today
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center justify-center size-8 rounded-lg border border-stroke bg-white text-dark-6 hover:bg-gray-50 transition-colors"
          aria-label="Next day"
        >
          <ChevronRightIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
