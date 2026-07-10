import { HeroSection } from '@/app/sections/hero-sections';
import { Stats } from '@/app/sections/stats';
import { Gallery } from '@/app/sections/gallery';
import { WhyChooseUs } from '@/app/sections/why-choose-us';
import { Testimonials } from '@/app/sections/testimonials';
import { CallToAction } from '@/app/sections/call-to-action';
import { Contact } from '@/app/sections/contact';

export function CoastalExperiencesPage() {
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

export default CoastalExperiencesPage;