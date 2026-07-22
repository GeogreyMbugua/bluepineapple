import Image from 'next/image';

export default function HeroBackground() {
  return (
    // z-0 (not -z-10) — avoids the parent-background-paints-over-negative-z-index bug.
    // Anything meant to sit above this just needs z-10, no negative math required.
    <div aria-hidden className="fixed inset-0 z-0 overflow-hidden">
      <Image
        src="/brand/hero2.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="hero-bg-mobile object-cover"
      />
      <div className="absolute inset-0 bg-[var(--color-navy-deep)]/80" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85" />
    </div>
  );
}