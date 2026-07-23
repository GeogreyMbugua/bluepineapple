import { Experience } from "./_components/Experience";
import { Faq } from "./_components/Faq";
import { FinalCta } from "./_components/FinalCta";
import { Hero } from "./_components/Hero";
import { Inclusions } from "./_components/Inclusions";
import { Itinerary } from "./_components/Itinerary";
import { Pricing } from "./_components/Pricing";
import { RouteFaresTeaser } from "./_components/RouteFaresTeaser";
import { Safety } from "./_components/Safety";
import { SectionNav } from "./_components/SectionNav";
import { TripDetailsSection } from "./_components/TripDetails";

export default function FortJesusTrip() {
  return (
    <main className="bg-[#f7f3eb] pb-24 text-slate-950 sm:pb-0">
      <Hero />
      <Inclusions />
      <SectionNav />
      <RouteFaresTeaser />
      <Experience />
      <Itinerary />
      <Safety />
      <Pricing />
      <TripDetailsSection />
      <Faq />
      <FinalCta />
    </main>
  );
}
