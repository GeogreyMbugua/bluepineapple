'use client';

import { useState } from 'react';
import { Autoplay, A11y, Keyboard } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperInstance } from 'swiper';

import 'swiper/css';

import { ExperienceSlide } from './ExperienceSlide';
import { RouteSlide } from './RouteSlide';
import { FareSlide } from './FareSlide';

const SLIDES = [
  { id: 'experience', label: '01', title: 'Experience', node: <ExperienceSlide /> },
  { id: 'route', label: '02', title: 'Route', node: <RouteSlide /> },
  { id: 'fares', label: '03', title: 'Fares', node: <FareSlide /> },
] as const;

export function FortJesusFlyerSwiper() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);

  return (
    <div className="fort-jesus-flyer-swiper w-full">
      <Swiper
        modules={[Autoplay, A11y, Keyboard]}
        onSwiper={setSwiper}
        onSlideChange={(instance) => setActiveIndex(instance.realIndex)}
        slidesPerView={1}
        spaceBetween={0}
        speed={700}
        loop
        keyboard={{ enabled: true }}
        a11y={{
          enabled: true,
          prevSlideMessage: 'Previous flyer page',
          nextSlideMessage: 'Next flyer page',
        }}
        autoplay={{
          delay: 5500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        className="overflow-hidden rounded-2xl"
      >
        {SLIDES.map((slide) => (
          <SwiperSlide key={slide.id} className="!h-auto">
            {slide.node}
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="mt-3 flex items-center justify-between gap-3 sm:mt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 sm:text-[11px]">
          Trip guide · {SLIDES[activeIndex]?.title}
        </p>
        <div
          className="flex items-center gap-1.5"
          role="tablist"
          aria-label="Flyer pages"
        >
          {SLIDES.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={activeIndex === index}
              aria-label={`Flyer page ${slide.label}: ${slide.title}`}
              onClick={() => swiper?.slideToLoop(index)}
              className={[
                'inline-flex min-h-10 min-w-10 items-center justify-center rounded-full text-[11px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#e8c27a]/70 sm:min-h-9 sm:min-w-9',
                activeIndex === index
                  ? 'bg-[#e8c27a] text-[#0d3b66]'
                  : 'bg-white/10 text-white/80 hover:bg-white/20',
              ].join(' ')}
            >
              {slide.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
