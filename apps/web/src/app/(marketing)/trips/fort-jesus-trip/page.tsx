import { Hero } from "./_components/Hero";
import { RouteTimetable } from "./_components/RouteTimetable";

import { FinalCta } from "./_components/FinalCta";

export default function FortJesusTrip() {
  return (
    <main className="min-h-[100dvh] overflow-hidden bg-white text-slate-950 md:min-h-0 md:overflow-visible">
      <Hero />
      <div className="hidden md:block">
        <RouteTimetable />
        <FinalCta />
      </div>
    </main>
  );
}
