import { Check } from "lucide-react";
import { trip } from "../_data/trip";

export function Inclusions() {
  return (
    <section className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <ul className="flex flex-wrap gap-x-6 gap-y-2.5 text-sm text-slate-700">
          {trip.inclusions.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Check size={14} className="shrink-0 text-[#0d3b66]" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
