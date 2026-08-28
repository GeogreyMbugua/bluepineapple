import { Hero } from "./_components/Hero";
import { RouteTimetable } from "./_components/RouteTimetable";

import { FinalCta } from "./_components/FinalCta";

export default function FortJesusTrip() {
  return (
    <main className="bg-white text-slate-950">
      <Hero />
      <RouteTimetable />
      
      <FinalCta />
    </main>
  );
}
