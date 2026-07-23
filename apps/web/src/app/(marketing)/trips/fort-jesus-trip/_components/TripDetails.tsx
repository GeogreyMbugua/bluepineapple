import { tripDetails } from "../_data/trip";

export function TripDetailsSection() {
  return (
    <section id="departure" className="scroll-mt-14 bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b58845] sm:text-xs sm:tracking-[0.28em]">
          Departure
        </p>
        <h2 className="mt-3 max-w-lg text-2xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
          Trip Details
        </h2>

        <dl className="mt-8 grid grid-cols-1 gap-6 sm:mt-10 sm:grid-cols-2 sm:gap-8">
          {tripDetails.map((detail) => (
            <div key={detail.label} className="border-t border-slate-200 pt-4">
              <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">{detail.label}</dt>
              <dd className="mt-1.5 text-base font-medium text-slate-950">{detail.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
