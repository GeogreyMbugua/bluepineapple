'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { publicPath } from '@/lib/paths';
import { BookingCard } from './BookingCard';
import { OtherExperiences } from './OtherExperiences';

export function Hero() {
  const [mobileBookingOpen, setMobileBookingOpen] = useState(false);

  return (
    <>
      <section className="relative hidden overflow-hidden bg-white pb-10 pt-20 md:block md:bg-slate-950 md:pb-5 md:pt-24 lg:pb-14">
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        <Image
          src={publicPath('/assets/experiences/fortjesus/fortstock.webp')}
          alt=""
          fill
          className="hero-bg-drift object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-slate-950/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/45 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="hidden items-center gap-0 md:grid md:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)] md:gap-6 lg:gap-10">
          <div className="hero-banner-enter flex justify-center md:justify-start">
            <div className="w-full max-w-2xl rounded-2xl border border-white/60 bg-white p-2 shadow-2xl">
              <Image
                src={publicPath('/assets/experiences/fortjesus/watertaxi.webp')}
                alt="Fort Jesus water taxi information banner"
                width={1536}
                height={1024}
                priority
                sizes="(min-width: 1024px) 65vw, 100vw"
                className="h-auto w-full rounded-xl object-contain"
              />
            </div>
          </div>

          <div className="hero-card-enter w-full md:justify-self-end">
            <BookingCard />
          </div>
        </div>
      </div>
      </section>

      <section
        aria-label="Fort Jesus coastal view"
        className="relative h-[100dvh] min-h-[100dvh] w-full overflow-hidden md:hidden"
      >
        <Image
          src={publicPath('/assets/experiences/fortjesus/mobile.jpg')}
          alt="Fort Jesus and a water taxi on the Mombasa coast"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-x-0 top-[18%] z-10 px-5 sm:top-[20%]">
          <div className="max-w-[18rem] text-slate-950 drop-shadow-[0_2px_10px_rgba(255,255,255,0.35)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em]">
              Fort Jesus Water Taxi
            </p>
            <h1 className="mt-2 text-[2.35rem] font-semibold leading-[0.98] tracking-[-0.04em]">
              Hop on.
              <br />
              See the coast.
            </h1>
            <p className="mt-3 max-w-[15rem] text-sm font-medium leading-5 text-slate-800">
              Mtwapa Beach to Fort Jesus.
            </p>
            <button
              type="button"
              aria-expanded={mobileBookingOpen}
              aria-controls="mobile-booking-dialog"
              onClick={() => setMobileBookingOpen(true)}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#0d3b66] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-[#0b335a] focus:outline-none focus:ring-2 focus:ring-[#0d3b66] focus:ring-offset-2 focus:ring-offset-transparent"
            >
              Book now
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
        <OtherExperiences />
      </section>
      <div className="md:hidden">
        <BookingCard
          mobileSheetOpen={mobileBookingOpen}
          onMobileSheetOpenChange={setMobileBookingOpen}
          hideMobileTrigger
        />
      </div>
    </>
  );
}
