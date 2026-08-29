import Image from "next/image";
import { ArrowUpRight, CircleDot, Clock3, Users } from "lucide-react";
import { publicPath } from "@/lib/paths";

const mobileRoute = [
  "Mtwapa Beach (Copacabana)",
  "Serena Hotel",
  "Whitesands Hotel",
  "Bamburi Beach Hotel",
  "Pirates Beach",
  "Mombasa Beach",
  "Nyali Beach",
  "English Point",
];

const mobileFares = [
  { stops: 1, adult: 500, child: 250, returnFare: 800 },
  { stops: 2, adult: 700, child: 375, returnFare: 1200 },
  { stops: 3, adult: 1000, child: 500, returnFare: 1500 },
  { stops: 4, adult: 1400, child: 700, returnFare: 1900 },
  { stops: 5, adult: 1800, child: 900, returnFare: 2300 },
  { stops: 6, adult: 2200, child: 1100, returnFare: 2700 },
  { stops: 7, adult: 2600, child: 1300, returnFare: 3100 },
  { stops: 8, adult: 3000, child: 1500, returnFare: 5000 },
];

export function RouteTimetable() {
  return (
    <section id="route" className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b58845] sm:text-xs sm:tracking-[0.28em]">
            Route
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Board anywhere along the coast
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Hop on at any stop from Mtwapa Beach to Fort Jesus. See every coastal stop and fare at a glance.
          </p>
        </div>

        <div className="mt-10 hidden justify-center md:flex">
          <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <Image
              src={publicPath("/assets/experiences/fortjesus/water-taxi.png")}
              alt="Fort Jesus Water Taxi route flyer showing all stops from Mtwapa Beach to Fort Jesus with fares and discounts"
              width={1200}
              height={800}
              className="h-auto w-full"
              sizes="100vw"
            />
          </div>
        </div>

        <div className="mt-8 hidden md:block">
          <a
            href="/trips/fort-jesus-trip/book"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0d3b66] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0b335a] focus:outline-none focus:ring-2 focus:ring-[#0d3b66] focus:ring-offset-2"
          >
            Book now
            <ArrowUpRight size={16} />
          </a>
        </div>

        <div className="mt-10 md:hidden">
          <div className="relative pl-8">
            <div className="absolute bottom-6 left-[0.4375rem] top-6 w-px bg-slate-200" />
            {mobileRoute.map((stop, index) => (
              <div key={stop} className="relative flex min-h-[60px] items-start gap-4">
                <span className="absolute -left-8 top-1 grid h-4 w-4 place-items-center rounded-full border-2 border-white bg-[#b58845] ring-1 ring-[#b58845]/35">
                  <CircleDot className="h-2.5 w-2.5 text-white" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{stop}</p>
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                    Stop {index + 1}
                  </p>
                </div>
              </div>
            ))}
            <div className="relative flex items-start gap-4">
              <span className="absolute -left-8 top-0 grid h-5 w-5 place-items-center rounded-full border-2 border-[#b58845] bg-[#0d3b66] text-[10px] font-bold text-white">
                ★
              </span>
              <div>
                <p className="text-base font-semibold text-slate-950">Fort Jesus</p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#b58845]">
                  Destination
                </p>
              </div>
            </div>
          </div>

          <div className="mt-14 border-t border-slate-200 pt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b58845]">Fares</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Simple, transparent pricing</h3>
              </div>
              <p className="text-right text-[11px] leading-4 text-slate-500">Per guest<br />in KES</p>
            </div>

            <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
              <div className="min-w-[430px]">
                <div className="grid grid-cols-[1fr_72px_72px_72px_78px] gap-2 bg-slate-50 px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  <span>Stops</span>
                  <span className="text-right">Adult</span>
                  <span className="text-right">Child</span>
                  <span className="text-right">Under 5</span>
                  <span className="text-right">Return</span>
                </div>
                {mobileFares.map((fare) => (
                  <div key={fare.stops} className={`grid grid-cols-[1fr_72px_72px_72px_78px] gap-2 border-t border-slate-100 px-3 py-3 text-sm ${fare.stops === 8 ? "bg-[#0d3b66]/5" : "bg-white"}`}>
                    <span className="font-medium text-slate-700">{fare.stops} stop{fare.stops > 1 ? "s" : ""}</span>
                    <span className="text-right font-semibold text-slate-950">{fare.adult.toLocaleString()}</span>
                    <span className="text-right font-semibold text-slate-950">{fare.child.toLocaleString()}</span>
                    <span className="text-right font-medium text-slate-500">FREE</span>
                    <span className="text-right font-semibold text-slate-950">{fare.returnFare.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-3 text-[11px] text-slate-500">Swipe to see all fare details. All prices are in Kenyan shillings.</p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-6 border-y border-slate-200 py-7">
            <div className="flex gap-3">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#b58845]" />
              <div>
                <p className="text-xs font-semibold text-slate-950">Daily departures</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">From Mtwapa Beach, multiple trips daily until 5:30PM</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-[#b58845]" />
              <div>
                <p className="text-xs font-semibold text-slate-950">Family friendly</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">10% off couples · 20% off 4+ paying adults</p>
              </div>
            </div>
            <div className="col-span-2 text-xs leading-5 text-slate-600">
              <span className="font-semibold text-slate-950">How it works: </span>
              Choose your stop, step aboard and enjoy the ride, then pay only for the stops you travel. Children 5–15 receive 50% off; children under 5 are free.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
