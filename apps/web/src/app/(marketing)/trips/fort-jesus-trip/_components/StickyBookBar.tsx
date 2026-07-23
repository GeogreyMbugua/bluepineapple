import { trip } from "../_data/trip";

export function StickyBookBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white px-4 py-3 sm:hidden">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.1em] text-slate-500">From</p>
          <p className="text-base font-semibold text-slate-950">Ksh {trip.priceFrom}</p>
        </div>
        <a
          href={trip.whatsapp.reserve}
          className="inline-flex min-h-11 w-full max-w-[220px] flex-1 items-center justify-center rounded-md bg-[#0d3b66] px-5 text-sm font-semibold text-white transition hover:bg-[#0b335a]"
        >
          Reserve spot
        </a>
      </div>
    </div>
  );
}
