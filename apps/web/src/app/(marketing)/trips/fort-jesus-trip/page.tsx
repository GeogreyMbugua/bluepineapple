import { Hero } from "./_components/Hero";
import { QuickFacts } from "./_components/QuickFacts";
import { RouteTimetable } from "./_components/RouteTimetable";
import { FinalCta } from "./_components/FinalCta";

export default function FortJesusTrip() {
  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-white text-slate-950 md:min-h-0 md:overflow-visible">
      <Hero />
      <QuickFacts />
      <RouteTimetable />
      <FinalCta />
    </main>
  );
}
