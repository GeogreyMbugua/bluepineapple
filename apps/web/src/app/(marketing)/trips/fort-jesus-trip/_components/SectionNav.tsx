const links = [
  { href: "#route-fares", label: "Route & Fares" },
  { href: "#itinerary", label: "Itinerary" },
  { href: "#safety", label: "Safety & Comfort" },
  { href: "#departure", label: "Departure" },
];

export function SectionNav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200 bg-[#f7f3eb]">
      <div className="mx-auto flex max-w-5xl gap-6 overflow-x-auto px-4 py-3 text-sm font-medium text-slate-600 sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        {links.map((link) => (
          <a key={link.href} href={link.href} className="shrink-0 whitespace-nowrap transition hover:text-slate-950">
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
