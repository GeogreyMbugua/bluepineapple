'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { publicPath } from '@/lib/paths';
import { trip } from '../../_data/trip';
import { FortJesusFlyerSwiper } from './FortJesusFlyerSwiper';
import { BookingWidget } from './BookingWidget';

function HeroCopy({ className = '' }: { readonly className?: string }) {
  return (
    <div className={['max-w-2xl text-white', className].filter(Boolean).join(' ')}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#e8c27a] md:text-[11px] md:tracking-[0.28em]">
        {trip.name}
      </p>
      <h1 className="mt-3 text-[2.15rem] font-semibold leading-[1.02] tracking-[-0.035em] md:text-4xl md:leading-[1.05] lg:text-[2.75rem]">
        Hop On. Hop Off.
        <span className="mt-1 block text-white/95">Your Coast. Your Way.</span>
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-200 md:mt-4 md:text-base">
        {trip.description}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3 md:mt-6">
        <a
          href="#route"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40"
        >
          Explore the route
        </a>
        <a
          href="#fares"
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 py-2.5 text-sm font-semibold text-[#e8c27a] transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          From {trip.priceFrom.toLocaleString()} KES
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      </div>
      <p className="mt-4 text-xs text-slate-300 md:mt-5 md:text-sm">
        {trip.departureTime} daily · {trip.coastalStops} stops · Last return {trip.lastReturn}
      </p>
    </div>
  );
}

export function FortJesusHero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 pb-12 pt-20 sm:pb-14 sm:pt-24 md:pb-16 md:pt-24 lg:pb-20 lg:pt-28">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src={publicPath('/assets/experiences/fortjesus/fort2.webp')}
          alt=""
          fill
          priority
          className="hero-bg-drift object-cover object-[center_40%] opacity-90"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071a2e]/80 via-[#0d3b66]/30 to-[#0d3b66]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071a2e]/65 via-[#0d3b66]/20 to-transparent" />
        <div className="absolute inset-0 bg-slate-950/10" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="hero-banner-enter">
          <HeroCopy />
        </div>

        <div className="mt-5 grid grid-cols-1 items-start gap-5 md:mt-6 md:grid-cols-[minmax(0,1.35fr)_minmax(18.5rem,22.5rem)] md:gap-7 lg:gap-9">
          <div className="hero-banner-enter min-w-0">
            <FortJesusFlyerSwiper />
          </div>
          <div className="hero-card-enter w-full md:sticky md:top-28">
            <BookingWidget />
          </div>
        </div>
      </div>
    </section>
  );
}
