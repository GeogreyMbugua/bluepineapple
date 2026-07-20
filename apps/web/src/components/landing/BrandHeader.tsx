import Image from 'next/image';
import { Fraunces } from 'next/font/google';

const fraunces = Fraunces({ subsets: ['latin'], weight: ['600'], display: 'swap' });

export function BrandHeader() {
  return (
    <header className="flex flex-col items-center justify-center gap-3 py-8 text-center md:py-14">
      {/*
        The source logo.png has a white square baked into the canvas around
        the circular badge — that's what was showing as a floating white box
        in the mobile screenshot. Clipping the image container to a circle
        removes the square corners, leaving just the round mark.
        `scale-110` nudges the badge slightly past the clip edge so no sliver
        of the square shows if the badge doesn't reach the canvas edge.
        Best long-term fix: ask the client/designer for a transparent-
        background circular export so this workaround isn't needed at all.
      */}
      <div className="relative h-16 w-16 overflow-hidden rounded-full ring-1 ring-[var(--color-paper)]/25 md:h-20 md:w-20">
        <Image
          src="/brand/logo.png"
          alt="Blue Pineapple Holdings"
          fill
          priority
          className="scale-110 object-cover"
        />
      </div>

      <div>
        <h1
          className={`${fraunces.className} text-2xl leading-tight tracking-wide text-white drop-shadow-[0_1px_18px_rgba(0,0,0,0.35)] md:text-4xl`}
        >
          Blue Pineapple Holdings
        </h1>

        <div className="mt-3 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-[var(--color-gold)]/60" aria-hidden />
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-[var(--color-gold)] md:text-xs">
            Coastal Living. Smart Investments.
          </p>
          <span className="h-px w-8 bg-[var(--color-gold)]/60" aria-hidden />
        </div>
      </div>
    </header>
  );
}

export default BrandHeader;