import Image from 'next/image';
import { MapPin, Clock3 } from 'lucide-react';
import { publicPath } from '@/lib/paths';
import { trip } from '../../_data/trip';
import { FlyerSlideShell } from './FlyerSlideShell';

export function ExperienceSlide() {
  return (
    <FlyerSlideShell label="Experience — Fort Jesus Water Taxi">
      <div className="grid h-full min-h-0 grid-rows-[auto_minmax(9rem,1fr)] sm:grid-rows-none sm:grid-cols-[1.02fr_0.98fr]">
        <div className="flex min-h-0 flex-col justify-between gap-3 p-4 sm:gap-4 sm:p-5 lg:p-6">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#b58845] sm:text-[10px] sm:tracking-[0.26em]">
              {trip.name}
            </p>
            <h3 className="mt-2 text-xl font-semibold leading-[1.08] tracking-tight text-[#0d3b66] sm:text-2xl lg:text-[1.7rem]">
              Hop On. Hop Off.
              <span className="mt-1 block text-slate-800">Your Coast. Your Way.</span>
            </h3>
            <p className="mt-2 max-w-[20rem] text-[11px] leading-relaxed text-slate-600 sm:mt-3 sm:text-xs lg:text-[13px]">
              Flexible coastal hops from Mtwapa Beach to the historic harbour at Fort Jesus.
            </p>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-700 sm:text-[11px]">
                <MapPin className="h-3 w-3 text-[#b58845]" aria-hidden="true" />
                Mtwapa Beach → Fort Jesus
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-700 sm:text-[11px]">
                <Clock3 className="h-3 w-3 text-[#b58845]" aria-hidden="true" />
                Daily from {trip.departureTime}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-2.5 py-2 sm:px-3 sm:py-2.5">
              <div>
                <p className="text-sm font-semibold text-[#0d3b66] sm:text-base">{trip.coastalStops}</p>
                <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:text-[9px]">
                  Stops
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0d3b66] sm:text-base">
                  {trip.priceFrom.toLocaleString()} KES
                </p>
                <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:text-[9px]">
                  From
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0d3b66] sm:text-base">{trip.lastReturn}</p>
                <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:text-[9px]">
                  Last return
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative min-h-[9rem] sm:min-h-0">
          <Image
            src={publicPath('/assets/experiences/fortjesus/fort2.webp')}
            alt="Coastal water taxi along the Mombasa shoreline"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 40vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d3b66]/50 via-transparent to-transparent sm:bg-gradient-to-l sm:from-transparent sm:to-[#faf8f4]/25" />
          <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/25 bg-[#0d3b66]/88 px-3 py-2 text-white backdrop-blur-sm sm:bottom-4 sm:left-4 sm:right-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#e8c27a]">
              Coastal passage
            </p>
            <p className="mt-0.5 text-xs font-semibold sm:text-sm">
              {trip.coastalStops} stops · Last return {trip.lastReturn}
            </p>
          </div>
        </div>
      </div>
    </FlyerSlideShell>
  );
}
