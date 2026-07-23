import Image from "next/image";
import { experience } from "../_data/trip";
import { publicPath } from "@/lib/paths";

export function Experience() {
  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b58845] sm:text-xs sm:tracking-[0.28em]">
          Experience
        </p>
        <h2 className="mt-3 max-w-lg text-2xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
          What you&apos;ll feel
        </h2>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-base sm:leading-7">
          A coastal cruise with iconic views, heritage landmarks, and time to explore Old Town — designed to be
          effortless, safe, and memorable.
        </p>

        <div className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-3 sm:gap-6">
          {experience.map((item, index) => (
            <div key={item.title} className="overflow-hidden rounded-lg border border-slate-200">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                <Image
                  src={publicPath(item.image)}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-5 sm:p-6">
                <span className="text-xs font-semibold text-[#b58845]">0{index + 1}</span>
                <p className="mt-3 text-base font-semibold text-slate-950">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
