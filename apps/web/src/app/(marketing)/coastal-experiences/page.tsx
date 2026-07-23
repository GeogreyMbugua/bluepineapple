import { CoastalHeroSection } from '@/app/sections/coastal-hero';
import { CoastalTrust } from '@/app/sections/coastal-trust';
import { Gallery } from '@/app/sections/gallery';
import { Testimonials } from '@/app/sections/testimonials';
import { CallToAction } from '@/app/sections/call-to-action';
import { Contact } from '@/app/sections/contact';
import { CoastalExperiences } from '@/app/sections/coastal-experiences';
import { CoastalFleet } from '@/app/sections/coastal-fleet';

export function CoastalExperiencesPage() {
  return (
    <main className="bg-background text-foreground">
      <CoastalHeroSection />
      <CoastalTrust />
      <CoastalExperiences />
      <CoastalFleet />
      <Gallery variant="coastal" />
      <Testimonials variant="coastal" />
      <CallToAction variant="coastal" />
      <Contact variant="coastal" />
    </main>
  );
}

export default CoastalExperiencesPage;
