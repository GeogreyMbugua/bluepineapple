import Image from 'next/image';
import { Fraunces } from 'next/font/google';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['600'], display: 'swap' });

export function BrandHeader() {
  return (
    <header className="flex flex-col items-center justify-center text-center md:gap-2 md:py-14">
      {/*
        The source logo.png has a white square baked into the canvas around
        the circular badge. Clipping the image container to a circle removes
        the square corners. scale-110 ensures the badge reaches the clip edge.
      */}
      <div className="relative size-14 overflow-hidden rounded-full ring-1 ring-[var(--color-paper)]/20 md:size-20">
        <Image
          src="/brand/logo.png"
          alt=""
          fill
          priority
          className="scale-110 object-cover"
        />
      </div>

      {/* Mobile wordmark — matches mockup lockup */}
      <div className="mt-4 md:hidden">
        <p
          className={`${fraunces.className} text-[1.05rem] leading-none tracking-[0.08em] text-white`}
        >
          BLUE PINEAPPLE
        </p>
        <div className="mt-2 flex items-center justify-center gap-2.5">
          <span className="h-px w-5 bg-white/35" aria-hidden />
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/70">
            Holdings
          </p>
          <span className="h-px w-5 bg-white/35" aria-hidden />
        </div>
      </div>

      <h1
        className={`${fraunces.className} sr-only mt-2 text-4xl leading-tight tracking-wide text-white drop-shadow-[0_1px_18px_rgba(0,0,0,0.35)] md:not-sr-only md:block`}
      >
        Blue Pineapple Holdings
      </h1>

      {/* Mobile headline — “Investments.” uses sea accent per mockup */}
      <p
        className={`${fraunces.className} mt-9 max-w-[280px] text-[1.85rem] leading-[1.28] tracking-wide text-white drop-shadow-[0_1px_18px_rgba(0,0,0,0.35)] md:hidden`}
      >
        Coastal Living.
        <br />
        Smart <span className="text-[var(--color-sea)]">Investments.</span>
      </p>

      {/* Desktop: approved compact gold tagline */}
      <div className="mt-3 hidden items-center justify-center gap-3 md:flex">
        <span className="h-px w-6 bg-[var(--color-gold)]/60" aria-hidden />
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--color-gold)]">
          Coastal Living. Smart Investments.
        </p>
        <span className="h-px w-6 bg-[var(--color-gold)]/60" aria-hidden />
      </div>
    </header>
  );
}

export default BrandHeader;
