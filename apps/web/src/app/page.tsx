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

export default function Home() {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      <HeroBackground />

      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        <div className="mx-auto w-full max-w-6xl px-6">
          <BrandHeader />
        </div>

        {/*
          No more outer card/padding wrapper here — each ArmPanel now sits
          directly on the photo. A single thin rule (divide-x / divide-y)
          separates the two entries instead of two boxed cards; it reads as
          one clean section, not two stacked components.
        */}
        <div className="flex flex-1 items-center justify-center">
          <div className="flex w-full max-w-5xl flex-col divide-y divide-[var(--color-paper)]/15 md:flex-row md:divide-x md:divide-y-0">
            <ArmPanel
              label="Experiences"
              title="Coastal Experiences"
              sub="Boat charters, snorkelling and curated coastal trips in Mombasa."
              href="/coastal-experiences"
              tone="sea"
            />

            <ArmPanel
              label="Investments"
              title="Real Estate"
              sub="Property development and coastal investments across Kenya."
              href="/real-estate"
              tone="navy"
            />
          </div>
        </div>

        <Footer />
      </div>
    </main>
  );
}