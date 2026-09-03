import {
  CHILD_FARE_RATE,
  ONE_WAY_FARES,
  RETURN_FARES,
} from '../../../../../../lib/pricing/constants';
import { trip } from '../../_data/trip';
import { FlyerSlideShell } from './FlyerSlideShell';

const featuredStops = [1, 2, 3, 4, 8] as const;

export function FareSlide() {
  return (
    <FlyerSlideShell label="Fares — adult, child, and return pricing">
      <div className="flex h-full min-h-0 flex-col p-4 sm:p-5 lg:p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#b58845] sm:text-[10px]">
              Fares
            </p>
            <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-[#0d3b66] sm:text-xl lg:text-2xl">
              From {trip.priceFrom.toLocaleString()} KES
            </h3>
          </div>
          <p className="text-right text-[10px] leading-snug text-slate-500 sm:text-[11px]">
            Per guest · KES
            <br />
            Under-5 free
          </p>
        </div>

        <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white sm:mt-4">
          <div className="grid grid-cols-[1fr_56px_56px_64px] gap-1 bg-slate-50 px-2.5 py-2 text-[8px] font-semibold uppercase tracking-[0.08em] text-slate-500 sm:grid-cols-[1fr_64px_64px_72px] sm:px-3 sm:text-[9px]">
            <span>Stops</span>
            <span className="text-right">Adult</span>
            <span className="text-right">Child</span>
            <span className="text-right">Return</span>
          </div>
          {featuredStops.map((segments) => {
            const adult = ONE_WAY_FARES[segments]!;
            const child = Math.round(adult * CHILD_FARE_RATE);
            const returnAdult = RETURN_FARES[segments]!;
            const isFull = segments === 8;
            return (
              <div
                key={segments}
                className={`grid grid-cols-[1fr_56px_56px_64px] gap-1 border-t border-slate-100 px-2.5 py-1.5 text-[11px] sm:grid-cols-[1fr_64px_64px_72px] sm:px-3 sm:py-2 sm:text-xs ${
                  isFull ? 'bg-[#0d3b66]/5' : ''
                }`}
              >
                <span className={`font-medium ${isFull ? 'text-[#0d3b66]' : 'text-slate-700'}`}>
                  {isFull ? 'Fort Jesus' : `${segments} stop${segments > 1 ? 's' : ''}`}
                </span>
                <span className="text-right font-semibold text-slate-950">
                  {adult.toLocaleString()}
                </span>
                <span className="text-right font-semibold text-slate-950">
                  {child.toLocaleString()}
                </span>
                <span className="text-right font-semibold text-slate-950">
                  {returnAdult.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-medium text-slate-600 sm:mt-3.5 sm:text-[11px]">
          <span className="rounded-full bg-[#e8c27a]/35 px-2.5 py-1 text-[#0d3b66]">
            Child 5–15: 5% off
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
            Under 5: free
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
            Return fares available
          </span>
        </div>
      </div>
    </FlyerSlideShell>
  );
}
