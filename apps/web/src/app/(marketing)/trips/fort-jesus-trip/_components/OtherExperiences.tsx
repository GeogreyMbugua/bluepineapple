import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Clock3 } from 'lucide-react';
import { publicPath } from '@/lib/paths';

const otherExperiences = [
  {
    title: 'Creek Safaris / Mangrove',
    category: 'Leisure',
    duration: '3 hours',
    price: 'Ksh 4,000/pax',
    image: publicPath('/assets/experiences/creek/creek1.webp'),
    href: '/trips/creek-safaris-mangrove',
  },
  {
    title: 'Sunset Sailing',
    category: 'Leisure',
    duration: '2h 30m',
    price: 'Ksh 3,000/pax',
    image: publicPath('/assets/experiences/sunset/sunset1.webp'),
    href: '/trips/sunset-sailing',
  },
  {
    title: 'Birthdays & Anniversaries',
    category: 'Family',
    duration: '2 hours',
    price: 'Ksh 2,000/pax',
    image: publicPath('/assets/experiences/events/event1.webp'),
    href: '/trips/birthdays-anniversaries',
  },
  {
    title: 'Snorkelling Reef',
    category: 'Adventure',
    duration: '2 hours',
    price: 'Ksh 2,000/pax',
    image: publicPath('/assets/experiences/snorkeling/snorkeling.webp'),
    href: '/trips/snorkelling-reef',
  },
];

export function OtherExperiences() {
  return (
    <section
      aria-labelledby="other-experiences-title"
      className="absolute inset-x-0 bottom-0 z-10 md:hidden"
    >
      <div className="bg-slate-950/75 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <p
            id="other-experiences-title"
            className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white"
          >
            More on the coast
          </p>
          <span className="shrink-0 text-[10px] font-medium text-white/60">
            Swipe to explore
          </span>
        </div>

        <div className="scrollbar-hidden mx-auto mt-3 flex max-w-lg snap-x gap-3 overflow-x-auto pb-1">
          {otherExperiences.map((experience) => (
            <Link
              key={experience.href}
              href={experience.href}
              className="group flex min-w-[17rem] snap-start items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-2.5 transition hover:bg-white/20"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                <Image
                  src={experience.image}
                  alt={experience.title}
                  fill
                  sizes="56px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-white/60">
                  <span>{experience.category}</span>
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  <span className="flex items-center gap-1">
                    <Clock3 className="h-3 w-3" aria-hidden="true" />
                    {experience.duration}
                  </span>
                </div>
                <h3 className="mt-1 truncate text-sm font-semibold text-white">
                  {experience.title}
                </h3>
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <p className="text-[11px] font-medium text-white/65">
                    {experience.price}
                  </p>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-[#d6ad69] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
