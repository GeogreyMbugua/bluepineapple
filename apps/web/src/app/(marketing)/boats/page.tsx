import { CoastalHeroSection } from '@/app/sections/coastal-hero';
import { CoastalFleet } from '@/app/sections/coastal-fleet';
import { CallToAction } from '@/app/sections/call-to-action';
import { Contact } from '@/app/sections/contact';

export function BoatsPage() {
  return (
    <main className="bg-background text-foreground">
      <CoastalHeroSection />
      <CoastalFleet />
      <CallToAction />
      <Contact />
    </main>
  );
}

export default BoatsPage;
