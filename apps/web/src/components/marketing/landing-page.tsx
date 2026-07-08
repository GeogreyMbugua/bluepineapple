import { CallToAction } from '@/app/sections/call-to-action';
import { Contact } from '@/app/sections/contact';
import { Gallery } from '@/app/sections/gallery';
import { HeroSection } from '@/app/sections/hero-sections';
import { Stats } from '@/app/sections/stats';
import { Testimonials } from '@/app/sections/testimonials';
import { WhyChooseUs } from '@/app/sections/why-choose-us';

export function LandingPage() {
  return (
    <main className="bg-background text-foreground">
      <HeroSection />
      <Stats />
      <Gallery />
      <WhyChooseUs />
      <Testimonials />
      <CallToAction />
      <Contact />
    </main>
  );
}

export default LandingPage;
