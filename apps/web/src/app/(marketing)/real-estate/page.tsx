import { RealEstateHeroSection } from '@/app/sections/real-estate-hero';
import { RealEstateTrust } from '@/app/sections/real-estate-trust';
import { RealEstateServices } from '@/app/sections/real-estate-services';
import { RealEstateProperties } from '@/app/sections/real-estate-properties';
import { RealEstateInvestments } from '@/app/sections/real-estate-investments';
import { RealEstateWhyChooseUs } from '@/app/sections/real-estate-why-choose-us';
import { Gallery } from '@/app/sections/gallery';
import { Testimonials } from '@/app/sections/testimonials';
import { CallToAction } from '@/app/sections/call-to-action';
import { Contact } from '@/app/sections/contact';

export function RealEstatePage() {
  return (
    <main className="bg-background text-foreground">
      <RealEstateHeroSection />
      <RealEstateTrust />
      <RealEstateServices />
      <RealEstateProperties />
      <RealEstateInvestments />
      <Gallery />
      <RealEstateWhyChooseUs />
      <Testimonials />
      <CallToAction />
      <Contact />
    </main>
  );
}

export default RealEstatePage;
