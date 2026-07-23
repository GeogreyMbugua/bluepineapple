import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { trip } from "../_data/trip";
import { publicPath } from "@/lib/paths";

function Fact({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950 sm:text-base">{value}</p>
    </div>
  );
}

export function Hero() {
  return (
    <section className="bg-[#f5efe4]">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="order-2 md:order-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b58845] sm:text-xs sm:tracking-[0.28em]">
              Hop-On Hop-Off Coastal Experience
            </p>

            <h1 className="mt-4 max-w-2xl text-[1.75rem] font-semibold leading-[1.2] tracking-tight text-slate-950 sm:mt-5 sm:text-5xl sm:leading-[1.1] lg:text-6xl">
              {trip.name}
            </h1>

            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:mt-5 sm:text-lg sm:leading-8">
              {trip.tagline}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <a
                href={trip.whatsapp.reserve}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#0d3b66] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0b335a]"
              >
                Reserve spot
                <ArrowUpRight size={16} />
              </a>
              <a
                href="#route-fares"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-400"
              >
                View route & fares
              </a>
              <a
                href="#itinerary"
                className="inline-flex min-h-12 items-center justify-center text-sm font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-950"
              >
                View itinerary
              </a>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-slate-200 pt-8 sm:mt-12 sm:grid-cols-4 sm:pt-10">
              <Fact label="Duration" value={trip.duration} />
              <Fact label="Location" value={trip.location} />
              <Fact label="Vessel" value={trip.vessel.name} />
              <Fact label="From" value={`Ksh ${trip.priceFrom} / person`} />
            </div>
          </div>

          <div className="order-1 md:order-2 relative h-[260px] sm:h-[320px] md:h-[420px] lg:h-[480px] w-full overflow-hidden rounded-2xl bg-slate-100">
            <Image
              src={publicPath("/assets/experiences/fortjesus/fortstock.webp")}
              alt="Fort Jesus coastal arrival"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
