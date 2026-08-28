import Image from "next/image";
import { trip } from "../_data/trip";
import { publicPath } from "@/lib/paths";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-slate-900 py-20 sm:py-32">
      <div className="absolute inset-0">
        <Image
          src={publicPath("/assets/experiences/fortjesus/fort3.webp")}
          alt="Fort Jesus"
          fill
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b58845] sm:text-xs sm:tracking-[0.28em]">
            Ready to board?
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            Reserve your coastal passage today.
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-300">
            Select your route, date, and passengers online. Instant fare calculation and confirmation.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href="/trips/fort-jesus-trip/book"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0d3b66] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0b335a]"
            >
              Reserve your journey
            </a>
            <a
              href={trip.whatsapp.question}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              Ask a question
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-8 text-sm text-slate-400">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">WhatsApp</p>
              <p className="mt-1 text-white">+254 708 485 978</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Email</p>
              <p className="mt-1 text-white">bluepineappleholdings@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
