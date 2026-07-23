"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { publicPath } from "@/lib/paths";

type GalleryVariant = "default" | "coastal";

const defaultImages = [
  publicPath("/assets/crew.webp"),
  publicPath("/assets/image1.webp"),
  publicPath("/assets/galleryImage3.webp"),
  publicPath("/assets/location.webp"),
  publicPath("/assets/hunky04.webp"),
  publicPath("/assets/galleryImage2.webp"),
  publicPath("/assets/site.webp"),
];

const coastalImages = [
  publicPath("/assets/experiences/creek/creek2.webp"),
  publicPath("/assets/experiences/fortjesus/fort2.webp"),
  publicPath("/assets/experiences/sunset/sunset2.webp"),
  publicPath("/assets/experiences/events/event2.webp"),
  publicPath("/assets/experiences/snorkeling/snorkeling.webp"),
  publicPath("/assets/experiences/creek/creek1.webp"),
  publicPath("/assets/experiences/fortjesus/fort3.webp"),
  publicPath("/assets/experiences/sunset/sunset1.webp"),
];

export function Gallery({ variant = "default" }: { readonly variant?: GalleryVariant }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const images = variant === "coastal" ? coastalImages : defaultImages;
  const isCoastal = variant === "coastal";

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const media = window.matchMedia("(min-width: 768px)");

    const handleScroll = () => {
      if (!media.matches) {
        track.style.transform = "";
        return;
      }

      const rect = container.getBoundingClientRect();
      const viewHeight = window.innerHeight;
      const totalHeight = rect.height;
      const scrolled = -rect.top;
      const maxScroll = totalHeight - viewHeight;

      if (maxScroll <= 0) return;

      const progress = Math.max(0, Math.min(1, scrolled / maxScroll));
      const limit = Math.max(0, track.scrollWidth - window.innerWidth);

      track.style.transform = `translateX(-${progress * limit}px)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    media.addEventListener("change", handleScroll);
    const timer = setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      media.removeEventListener("change", handleScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <section id="gallery" className="w-full bg-white" aria-label={isCoastal ? "Coastal gallery" : "Gallery"}>
      {/* Mobile — snap carousel */}
      <div className="px-4 py-16 sm:px-6 md:hidden">
        {isCoastal ? (
          <div className="mb-8">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 bg-zinc-900" />
              <span className="text-sm text-zinc-900">GALLERY</span>
            </div>
            <h2 className="mt-4 text-3xl font-medium tracking-tight text-zinc-900">
              Moments on the water
            </h2>
            <p className="mt-2 max-w-md text-sm text-zinc-500">
              Harbour light, reef colour, and coastal days aboard Blue Pineapple.
            </p>
          </div>
        ) : null}

        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="relative h-[280px] w-[78%] shrink-0 snap-center overflow-hidden rounded-2xl bg-zinc-100"
            >
              <Image
                src={src}
                alt={`${isCoastal ? "Coastal" : "Gallery"} image ${index + 1}`}
                fill
                className="object-cover"
                sizes="78vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop — scroll-scrub gallery */}
      <div ref={containerRef} className="relative hidden h-[180vh] md:block">
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <div
            ref={trackRef}
            className="flex gap-5 px-4 py-16 will-change-transform md:px-16 md:py-20 lg:px-24 xl:px-32"
            style={{ touchAction: "pan-y" }}
          >
            {images.map((src, index) => (
              <Image
                key={`${src}-desktop-${index}`}
                src={src}
                alt={`${isCoastal ? "Coastal" : "Gallery"} image ${index + 1}`}
                width={364}
                height={457}
                className="pointer-events-none shrink-0 select-none object-cover"
                draggable={false}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
