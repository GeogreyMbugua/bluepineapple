import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { publicPath } from "@/lib/paths";

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
            Hop on at any stop from Mtwapa Beach to Fort Jesus. See the full route, stops, and fares on the flyer below.
          </p>
        </div>

        <div className="mt-10 flex justify-center">
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

        <div className="mt-8">
          <a
            href="/trips/fort-jesus-trip/book"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0d3b66] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0b335a] focus:outline-none focus:ring-2 focus:ring-[#0d3b66] focus:ring-offset-2"
          >
            Book now
            <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
