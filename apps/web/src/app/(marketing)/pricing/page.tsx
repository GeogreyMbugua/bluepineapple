"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { primaryButtonClass, invertedButtonClass } from '@/components/marketing/button';
import { sectionTitleClass, bodyClass } from '@/components/marketing/typography';
import { publicPath } from '@/lib/paths';

const fadeUp = {
  initial: { y: 40, opacity: 0 },
  whileInView: { y: 0, opacity: 1 },
  viewport: { once: true },
  transition: { type: "spring", stiffness: 320, damping: 70, mass: 1 },
} as const;

const packages = [
  {
    title: "Fort Jesus Tour",
    price: "From Ksh 500",
    duration: "8 hours",
    description: "A guided harbour cruise around historic Fort Jesus with expert storytelling and shore access.",
    href: "/trips/fort-jesus-trip",
    tag: "Cultural",
  },
  {
    title: "Sunset Sailing",
    price: "Ksh 3,000/pax",
    duration: "2h 30m",
    description: "Golden-hour sailing from Mombasa Marina with coastal views, chilled drinks, and photo moments.",
    href: "/trips/sunset-sailing",
    tag: "Leisure",
  },
  {
    title: "Snorkelling Reef",
    price: "Ksh 2,000/pax",
    duration: "2 hours",
    description: "Explore reef ecosystems with guided snorkel support, equipment, and safe coastal swimming.",
    href: "/trips/snorkelling-reef",
    tag: "Adventure",
  },
  {
    title: "Creek Safaris",
    price: "Ksh 4,000/pax",
    duration: "3 hours",
    description: "Mangrove safari through Mombasa’s quiet creek systems with birding and coastal wildlife highlights.",
    href: "/trips/creek-safaris-mangrove",
    tag: "Nature",
  },
  {
    title: "Private Events",
    price: "From Ksh 2,000/pax",
    duration: "Custom",
    description: "Celebrate birthdays, anniversaries, and private gatherings aboard a premium coastal vessel.",
    href: "/trips/birthdays-anniversaries",
    tag: "Events",
  },
];

export default function PricingPage() {
  return (
    <MarketingShell variant="parent">
      <main className="bg-white text-slate-950">
        <section className="relative overflow-hidden bg-black text-white">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
            style={{ backgroundImage: `url('${publicPath("/assets/hero1.webp")}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
          <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Transparent pricing</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Pricing for Blue Pineapple Coastal Experiences
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
                Discover clear package pricing for historic harbour tours, sunset sails, snorkelling reefs, creek safaris, and private coastal events.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/trips" className={primaryButtonClass}>
                  Browse all experiences
                </Link>
                <Link href="/contact" className={invertedButtonClass}>
                  Request a custom quote
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
              <div>
                <p className={"text-sm font-semibold uppercase tracking-[0.24em] text-cyan-600"}>
                  Coastal packages
                </p>
                <h2 className={`${sectionTitleClass} text-slate-950`}>
                  Clear pricing paired with unforgettable experiences
                </h2>
                <p className={`${bodyClass} mt-4 text-slate-600`}>
                  Every trip package includes experienced crew, life jackets, and curated coastal routes across Mombasa’s most scenic marine highlights.
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="text-sm uppercase tracking-[0.22em] text-slate-500">What’s included</div>
                  <ul className="space-y-3 text-sm text-slate-700">
                    <li>• Fully insured coastal boat trips</li>
                    <li>• Expert captain & crew</li>
                    <li>• Safety equipment and refreshments</li>
                    <li>• Local routes and curated shore stops</li>
                    <li>• Flexible group and private bookings</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-14 grid gap-6 lg:grid-cols-2">
              {packages.map((pkg, index) => (
                <motion.article
                  key={pkg.title}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, type: "spring", stiffness: 260, damping: 26 }}
                >
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-cyan-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white">
                        {pkg.tag}
                      </span>
                      <span className="text-sm font-semibold text-slate-600">{pkg.duration}</span>
                    </div>
                    <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">{pkg.title}</h3>
                    <p className="mt-4 text-sm leading-6 text-slate-600">{pkg.description}</p>
                    <div className="mt-6 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Starting price</p>
                        <p className="mt-2 text-3xl font-semibold text-slate-950">{pkg.price}</p>
                      </div>
                      <Link href={pkg.href} className="text-sm font-semibold text-cyan-950 transition hover:text-cyan-700">
                        View details →
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div>
                <p className={"text-sm font-semibold uppercase tracking-[0.24em] text-cyan-600"}>
                  Why Blue Pineapple
                </p>
                <h2 className={`${sectionTitleClass} text-slate-950`}>
                  A confident coastal booking experience
                </h2>
                <p className={`${bodyClass} mt-4 text-slate-600`}>
                  Book with clarity — our pricing is built around experiences you can trust, with transparent costs, expert crew, and flexible group options.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  "Experienced crew and safety-first vessels",
                  "Transparent pricing with no hidden fees",
                  "Easy bookings for private and group trips",
                  "Curated routes featuring Mombasa’s best coastlines",
                ].map((item) => (
                  <div key={item} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-cyan-950 py-20 sm:py-24 px-4 sm:px-6 lg:px-8 text-white">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[2fr_1fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Ready to book?</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                  Start your coastal booking today.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-100/90">
                  Reach out for a custom itinerary, group booking, or tailored private event package.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact" className={primaryButtonClass.replace('text-white', 'text-cyan-950')}>
                  Contact us
                </Link>
                <Link href="/trips" className={invertedButtonClass}>
                  View experiences
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
