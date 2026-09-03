import { Star } from 'lucide-react';
import { FlyerSlideShell } from './FlyerSlideShell';

/** Flyer marketing order (matches printed guide; booking uses pricing order). */
const flyerStops = [
  'Mtwapa Beach',
  'Serena Hotel',
  'Whitesands Hotel',
  'Bamburi Beach',
  'Pirates Beach',
  'Mombasa Beach',
  'Nyali Beach',
  'English Point',
] as const;

export function RouteSlide() {
  return (
    <FlyerSlideShell label="Route — eight coastal stops to Fort Jesus">
      <div className="flex h-full min-h-0 flex-col p-4 sm:p-5 lg:p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#b58845] sm:text-[10px]">
              Route overview
            </p>
            <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-[#0d3b66] sm:text-xl lg:text-2xl">
              8 coastal stops
            </h3>
          </div>
          <p className="max-w-[10rem] text-right text-[10px] leading-snug text-slate-500 sm:text-[11px]">
            Board anywhere. Ride as far as you like.
          </p>
        </div>

        <div className="mt-3 grid min-h-0 flex-1 grid-cols-2 gap-x-3 gap-y-1.5 sm:mt-4 sm:gap-x-5 sm:gap-y-2">
          {flyerStops.map((stop, index) => (
            <div key={stop} className="flex items-center gap-2">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#b58845] text-[9px] font-bold text-white sm:h-6 sm:w-6 sm:text-[10px]">
                {index + 1}
              </span>
              <span className="truncate text-[11px] font-semibold text-slate-800 sm:text-xs lg:text-sm">
                {stop}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-[#0d3b66]/15 bg-[#0d3b66] px-3 py-2.5 text-white sm:mt-4 sm:px-4">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-[#e8c27a] text-[#0d3b66]">
            <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#e8c27a]">
              Destination
            </p>
            <p className="text-sm font-semibold sm:text-base">Fort Jesus</p>
          </div>
        </div>
      </div>
    </FlyerSlideShell>
  );
}
