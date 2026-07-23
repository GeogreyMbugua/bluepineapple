import Link from "next/link";
import { offers, trip } from "../_data/trip";

export function Pricing() {
  return (
    <section className="bg-[#f7f3eb] py-14 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="rounded-lg bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Hop-On Hop-Off Fares
            </p>
            <p className="mt-3 text-sm text-slate-500">Starting from</p>
            <p className="mt-1 text-4xl font-semibold text-slate-950 sm:text-5xl">Ksh {trip.priceFrom}</p>
            <p className="mt-2 text-sm text-slate-600">Pay on board · Board at any stop · Under 5s free</p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/trips/fort-jesus-trip/route-fares"
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:border-slate-400"
              >
                View Full Fares
              </Link>
              <a
                href={trip.whatsapp.returnTrip}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-[#0d3b66] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b335a]"
              >
                Book Now
              </a>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Available Offers</p>
            <ul className="mt-4 space-y-3">
              {offers.map((offer) => (
                <li key={offer} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b58845]" />
                  {offer}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={trip.whatsapp.returnTrip}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-[#0d3b66] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b335a]"
              >
                Book Now
              </a>
              <a
                href={trip.whatsapp.question}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:border-slate-400"
              >
                Ask a Question
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
