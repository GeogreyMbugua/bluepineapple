import { quickFacts } from '../_data/trip';

export function QuickFacts() {
  return (
    <section
      aria-label="Trip quick facts"
      className="border-b border-slate-200 bg-white py-8 sm:py-10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {quickFacts.map((fact) => (
            <div
              key={fact.label}
              className="rounded-2xl border border-slate-200 bg-[#faf8f4] px-4 py-4 sm:px-5 sm:py-5"
            >
              <p className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                {fact.value}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#b58845]">
                {fact.label}
              </p>
              <p className="mt-1 text-sm text-slate-500">{fact.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
