import { ShieldCheck } from "lucide-react";
import { safety } from "../_data/trip";

export function Safety() {
  return (
    <section id="safety" className="scroll-mt-14 bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b58845] sm:text-xs sm:tracking-[0.28em]">
          Safety & Comfort
        </p>
        <h2 className="mt-3 max-w-lg text-2xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
          Every crossing, fully covered.
        </h2>

        <ul className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {safety.map((item) => (
            <li key={item} className="flex items-start gap-3 rounded-lg border border-slate-200 p-4">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#0d3b66]" />
              <span className="text-sm text-slate-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
