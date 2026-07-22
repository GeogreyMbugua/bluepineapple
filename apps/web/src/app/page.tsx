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
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 md:justify-start">
          <div className="flex flex-col items-center pt-6 md:pt-14">
            <BrandHeader />
          </div>

          <div className="flex flex-col items-center md:hidden">
            <span className="mt-7 h-px w-10 bg-white/30" aria-hidden />
            <p className="mt-5 text-[13px] font-normal tracking-wide text-white/50">
              Choose your journey below
            </p>
            <div className="mt-7 flex w-full flex-col gap-4">
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

        <div className="mt-auto hidden pt-28 md:block">
          <Footer />
        </div>
      </div>
    </main>
  );
}
