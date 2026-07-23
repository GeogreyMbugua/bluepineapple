import Image from "next/image";
import { itinerary } from "../_data/trip";
import { publicPath } from "@/lib/paths";

export function Itinerary() {
  return (
    <section id="itinerary" className="scroll-mt-14 bg-[#f7f3eb] py-14 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b58845] sm:text-xs sm:tracking-[0.28em]">
          Itinerary
        </p>
        <h2 className="mt-3 max-w-lg text-2xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
          Your route, journey highlights
        </h2>
        <p className="mt-2 text-sm text-slate-500">6 stops along the way</p>

        <ol className="mt-8 space-y-8 sm:mt-10 sm:space-y-12">
          {itinerary.map((item) => (
            <li key={item.step} className="grid gap-5 sm:grid-cols-[auto_1fr] sm:gap-6 lg:grid-cols-[auto_1fr_320px] lg:gap-8">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0d3b66] text-sm font-semibold text-white sm:h-12 sm:w-12 sm:text-base">
                {item.step}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#b58845]">
                  {item.tag}
                  {item.meta ? ` · ${item.meta}` : ""}
                </p>
                <p className="mt-1.5 text-base font-semibold text-slate-950 sm:text-lg">{item.title}</p>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">{item.description}</p>
              </div>
              {item.image ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 lg:aspect-auto lg:h-40">
                  <Image
                    src={publicPath(item.image)}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="320px"
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ol>

        <p className="mt-8 border-t border-slate-200 pt-6 text-sm italic text-slate-500 sm:mt-10">
          Return journey back to Mombasa Beach — same scenic route in reverse.
        </p>
      </div>
    </section>
  );
}
