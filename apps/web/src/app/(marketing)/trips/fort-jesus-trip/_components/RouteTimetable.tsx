import Link from 'next/link';
import {
  ArrowDown,
  ArrowRight,
  Download,
  Star,
} from 'lucide-react';
import { publicPath } from '@/lib/paths';
import {
  CHILD_FARE_RATE,
  ONE_WAY_FARES,
  RETURN_FARES,
} from '../../../../../lib/pricing/constants';
import { offers, stopDisplayNames, stops, trip } from '../_data/trip';

const fareRows = Object.keys(ONE_WAY_FARES)
  .map(Number)
  .sort((a, b) => a - b)
  .map((segments) => {
    const adult = ONE_WAY_FARES[segments]!;
    const child = Math.round(adult * CHILD_FARE_RATE);
    const returnAdult = RETURN_FARES[segments]!;
    return { segments, adult, child, returnAdult };
  });

export function RouteTimetable() {
  const intermediateStops = stops.slice(0, -1);
  const destination = stops[stops.length - 1]!;

  return (
    <>
      <section id="route" className="scroll-mt-24 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b58845] sm:text-xs sm:tracking-[0.28em]">
              Explore the route
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Board anywhere along the coast
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Hop on at any stop from Mtwapa Beach to Fort Jesus. Pay only for the
              segments you travel.
            </p>
          </div>

          {/* Desktop: horizontal timeline */}
          <div className="mt-10 hidden lg:block">
            <div className="overflow-x-auto pb-2">
              <ol className="flex min-w-[56rem] items-start justify-between gap-2">
                {intermediateStops.map((stop, index) => (
                  <li key={stop} className="relative flex min-w-0 flex-1 flex-col items-center text-center">
                    {index < intermediateStops.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="absolute left-[calc(50%+0.75rem)] right-[calc(-50%+0.75rem)] top-3 h-px bg-slate-200"
                      />
                    )}
                    <span className="relative z-10 grid h-6 w-6 place-items-center rounded-full bg-[#b58845] text-[10px] font-bold text-white ring-4 ring-white">
                      {index + 1}
                    </span>
                    <p className="mt-3 text-sm font-semibold leading-snug text-slate-950">
                      {stopDisplayNames[stop]}
                    </p>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
                      Stop {index + 1}
                    </p>
                  </li>
                ))}
                <li className="relative flex min-w-0 flex-1 flex-col items-center text-center">
                  <span className="relative z-10 grid h-7 w-7 place-items-center rounded-full bg-[#0d3b66] text-white ring-4 ring-white">
                    <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  </span>
                  <p className="mt-3 text-sm font-semibold leading-snug text-slate-950">
                    {stopDisplayNames[destination]}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#b58845]">
                    Destination
                  </p>
                </li>
              </ol>
            </div>
          </div>

          {/* Tablet / mobile: vertical timeline */}
          <div className="mt-10 lg:hidden">
            <ol className="relative space-y-0 pl-8">
              <div
                aria-hidden="true"
                className="absolute bottom-8 left-[0.9375rem] top-2 w-px bg-slate-200"
              />
              {intermediateStops.map((stop, index) => (
                <li key={stop} className="relative flex min-h-[3.5rem] items-start gap-4 pb-5">
                  <span className="absolute -left-8 top-0 grid h-5 w-5 place-items-center rounded-full bg-[#b58845] text-[10px] font-bold text-white ring-2 ring-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {stopDisplayNames[stop]}
                    </p>
                    <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                      Stop {index + 1}
                    </p>
                  </div>
                  {index < intermediateStops.length - 1 && (
                    <ArrowDown
                      className="absolute -left-[1.65rem] top-7 h-3 w-3 text-slate-300"
                      aria-hidden="true"
                    />
                  )}
                </li>
              ))}
              <li className="relative flex items-start gap-4">
                <span className="absolute -left-8 top-0 grid h-6 w-6 place-items-center rounded-full bg-[#0d3b66] text-white ring-2 ring-white">
                  <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-base font-semibold text-slate-950">
                    {stopDisplayNames[destination]}
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#b58845]">
                    Destination
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section id="fares" className="scroll-mt-24 bg-[#f7f3eb] py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b58845] sm:text-xs sm:tracking-[0.28em]">
                Fares
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl">
                Choose your trip
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Transparent pricing by segment. From {trip.priceFrom.toLocaleString()}{' '}
                KES for a single stop.
              </p>
              <ul className="mt-6 space-y-2.5">
                {offers.map((offer) => (
                  <li key={offer} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b58845]" />
                    {offer}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs leading-relaxed text-slate-500">
                Children 5–15 receive 5% off adult fare. Under 5 travel free. Return fares
                shown per adult.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="grid grid-cols-[1fr_72px_72px_80px] gap-2 bg-slate-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 sm:grid-cols-[1fr_88px_88px_96px] sm:px-5">
                <span>Stops</span>
                <span className="text-right">Adult</span>
                <span className="text-right">Child</span>
                <span className="text-right">Return</span>
              </div>
              {fareRows.map((row) => (
                <div
                  key={row.segments}
                  className={`grid grid-cols-[1fr_72px_72px_80px] gap-2 border-t border-slate-100 px-4 py-3 text-sm sm:grid-cols-[1fr_88px_88px_96px] sm:px-5 ${
                    row.segments === 8 ? 'bg-[#0d3b66]/5' : 'bg-white'
                  }`}
                >
                  <span className="font-medium text-slate-700">
                    {row.segments === 8
                      ? 'Fort Jesus (full route)'
                      : `${row.segments} stop${row.segments > 1 ? 's' : ''}`}
                  </span>
                  <span className="text-right font-semibold text-slate-950">
                    {row.adult.toLocaleString()}
                  </span>
                  <span className="text-right font-semibold text-slate-950">
                    {row.child.toLocaleString()}
                  </span>
                  <span className="text-right font-semibold text-slate-950">
                    {row.returnAdult.toLocaleString()}
                  </span>
                </div>
              ))}
              <p className="border-t border-slate-100 px-4 py-3 text-[11px] text-slate-500 sm:px-5">
                All prices in Kenyan shillings (KES), per guest.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-[#faf8f4] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b58845]">
                Plan your trip
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                Everything you need for the Fort Jesus Water Taxi
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Browse the interactive planner, or download the trip guide to share on
                WhatsApp.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:shrink-0">
              <Link
                href="/trips/fort-jesus-trip/route-fares"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0d3b66] px-5 text-sm font-semibold text-white transition hover:bg-[#0b335a]"
              >
                View route &amp; fares
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <a
                href={publicPath(trip.flyerPath)}
                download="fort-jesus-water-taxi-guide.png"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
              >
                <Download size={16} aria-hidden="true" />
                Download trip guide
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
