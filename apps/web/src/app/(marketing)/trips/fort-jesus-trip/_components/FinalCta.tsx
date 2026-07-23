import { trip } from "../_data/trip";

export function FinalCta() {
  return (
    <section className="bg-[#f5efe4] py-14 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b58845] sm:text-xs sm:tracking-[0.28em]">
              Ready to board?
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Reserve a coastal passage that feels effortless.
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-base sm:leading-7">
              Our team will confirm your selected route and complete your booking with thoughtful service and clear
              expectations.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm sm:p-8">
            <a
              href={trip.whatsapp.reserve}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#0d3b66] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0b335a]"
            >
              Reserve your journey
            </a>
            <div className="mt-6 space-y-4 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-slate-950">WhatsApp</p>
                <p>+254 708 485 978</p>
              </div>
              <div>
                <p className="font-semibold text-slate-950">Email</p>
                <p className="break-all">bluepineappleholdings@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
