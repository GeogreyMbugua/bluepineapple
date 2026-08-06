import { HeroSection } from '@/app/sections/hero-sections';
import { LandingHeader } from '@/components/marketing/landing-header';

export function LandingPage() {
  return (
    <main className="relative bg-white text-foreground">
      <LandingHeader />
      <HeroSection />
    </main>
  );
}

export default LandingPage;
