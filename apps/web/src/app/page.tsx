import { Metadata } from 'next';
import { BrandHeader, ArmPanel } from '@/components/landing';
import HeroBackground from '@/components/landing/HeroBackground';
import { Footer } from '@/components/marketing/footer';

export const metadata: Metadata = {
  title: 'Blue Pineapple Holdings — Coastal Experiences & Real Estate',
  description:
    'Blue Pineapple Holdings — Coastal Living. Smart Investments. Choose Coastal Experiences or Real Estate to continue.',
  openGraph: {
    images: ['/brand/logo.png'],
  },
};

const panels = [
  {
    label: 'Experiences',
    title: 'Coastal Experiences',
    sub: 'Boat charters, snorkelling and curated coastal trips in Mombasa.',
    href: '/coastal-experiences',
    tone: 'sea' as const,
  },
  {
    label: 'Investments',
    title: 'Real Estate',
    sub: 'Property development and coastal investments across Kenya.',
    href: '/real-estate',
    tone: 'navy' as const,
  },
];

export default function Home() {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      <HeroBackground />

      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="flex flex-col items-center pt-8 md:pt-14">
            <BrandHeader />
          </div>

          <div className="flex flex-col items-center gap-4 pt-16 md:hidden">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[var(--color-paper)]/80">
              Choose your journey
            </p>
            <div className="flex w-full max-w-md flex-col gap-4">
              {panels.map((panel) => (
                <ArmPanel key={panel.href} {...panel} />
              ))}
            </div>
          </div>

          <div className="hidden md:flex md:flex-1 md:items-center md:justify-center md:py-12">
            <div className="flex w-full max-w-5xl md:divide-x md:divide-y-0 md:divide-white/10">
              {panels.map((panel) => (
                <ArmPanel key={panel.href} {...panel} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto pt-10 md:pt-28">
          <Footer />
        </div>
      </div>
    </main>
  );
}
