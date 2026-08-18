'use client';

interface BlockedDateNoticeProps {
  reason: string;
}

export function BlockedDateNotice({ reason }: BlockedDateNoticeProps) {
  return (
    <div className="border border-red bg-red-light-5 rounded-lg p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="text-sm font-bold text-red">Operations Blocked</h3>
          <p className="text-sm text-red/80 mt-0.5">{reason}</p>
          <p className="text-xs text-red/60 mt-1">No departures are available for this date.</p>
        </div>
      </div>
    </div>
  );
}
