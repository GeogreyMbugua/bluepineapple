import Link from "next/link";
import { quickFares, timetablePreview } from "../_data/trip";

export function RouteFaresTeaser() {
  return (
    <section id="route-fares" className="scroll-mt-14 bg-[#f7f3eb] py-14 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b58845] sm:text-xs sm:tracking-[0.28em]">
          Route & fares
        </p>
        <h2 className="mt-3 max-w-lg text-2xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
          Hop-On. Hop-Off. Your Coast.
        </h2>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-base sm:leading-7">
          Board anywhere from Mtwapa Beach to Fort Jesus. See stops, timetable, and a live fare estimate — without
          scrolling a long page.
        </p>

        <div className="mt-8 grid gap-5 sm:mt-10 lg:grid-cols-2 lg:gap-6">
          <div className="rounded-lg bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Quick fares</p>
            <ul className="mt-4 divide-y divide-slate-100">
              {quickFares.map((fare) => (
                <li key={fare.label} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-slate-700">{fare.label}</span>
                  <span className="font-semibold text-slate-950">KES {fare.price.toLocaleString("en-US")}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              4–7 stops: KES 1,400 – 2,600 (add KES 400 per stop after 3)
            </p>
          </div>

          <div className="rounded-lg bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Timetable preview</p>
            <ul className="mt-4 space-y-3">
              {timetablePreview.map((row) => (
                <li key={row.point} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{row.point}</span>
                  <span className="font-medium text-slate-950">{row.time}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">9 stops along the coast</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-start gap-4 rounded-lg border border-dashed border-slate-300 p-5 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-sm font-semibold text-slate-950">Open the full planner</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Get the full stop list, fare table, route planner, and booking links in a focused panel.
            </p>
          </div>
          <Link
            href="/trips/fort-jesus-trip/route-fares"
            className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-md bg-[#0d3b66] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b335a] sm:w-auto"
          >
            View full route & fares
          </Link>
        </div>
      </div>
    </section>
  );
}
