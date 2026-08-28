import Image from "next/image";
import { trip } from "../_data/trip";
import { publicPath } from "@/lib/paths";
import { BookingCard } from "./BookingCard";

export function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-slate-900">
      <div className="absolute inset-0">
        <Image
          src={publicPath("/assets/experiences/fortjesus/fortstock.webp")}
          alt="Fort Jesus coastal arrival"
          fill
          priority
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-900/40" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-screen items-center py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b58845] sm:text-xs sm:tracking-[0.3em]">
                Hop-On Hop-Off Coastal Water Taxi
              </p>

              <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                {trip.name}
              </h1>

              <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
                {trip.tagline}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400">Departs</p>
                  <p className="mt-1.5 text-base font-semibold text-white sm:text-lg">{trip.departureTime}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400">Arrives</p>
                  <p className="mt-1.5 text-base font-semibold text-white sm:text-lg">11:30 AM</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400">Vessel</p>
                  <p className="mt-1.5 text-base font-semibold text-white sm:text-lg">{trip.vessel.name}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400">From</p>
                  <p className="mt-1.5 text-base font-semibold text-white sm:text-lg">Ksh {trip.priceFrom} / stop</p>
                </div>
              </div>
            </div>

            <div className="lg:justify-self-end lg:w-full lg:max-w-sm">
              <BookingCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
