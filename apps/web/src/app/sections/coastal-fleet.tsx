"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { publicPath } from "@/lib/paths";

type FleetBoat = {
  name: string;
  subtitle: string;
  capacity: string;
  hourly: string;
  daily: string;
  href: string;
  image: string;
  features: string[];
};

const fleet: FleetBoat[] = [
  {
    name: "Setting Sons",
    subtitle: "Luxury Coastal Cruiser",
    capacity: "Up to 35 guests",
    hourly: "Ksh 8,000/hr",
    daily: "Ksh 32,000/day",
    href: "/boats/setting-sons",
    image: publicPath("/assets/setting.webp"),
    features: ["Private charter", "Corporate events", "Harbour cruises"],
  },
  {
    name: "Hunky Dory",
    subtitle: "Glass Bottom Boat",
    capacity: "Up to 14 guests",
    hourly: "Ksh 5,000/hr",
    daily: "Ksh 20,000/day",
    href: "/boats/hunky-dory",
    image: publicPath("/assets/hunky11.webp"),
    features: ["Glass-bottom viewing", "Family friendly", "Marine tours"],
  },
];

export function CoastalFleet() {
  return (
    <section id="fleet" className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl"
        >
          <p className="text-sm tracking-[0.24em] text-cyan-600 uppercase">Our fleet</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
            Boats built for unforgettable coastal trips
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Choose the right vessel for your private charter, family outing, or scenic harbour cruise.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {fleet.map((boat) => (
            <motion.article
              key={boat.name}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md md:rounded-[28px] md:bg-slate-50"
            >
              <Link href={boat.href} className="block">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
                  <Image
                    src={boat.image}
                    alt={boat.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="space-y-4 p-5 sm:space-y-5 sm:p-8">
                  <div>
                    <p className="text-xs tracking-[0.24em] text-cyan-600 uppercase">Boat charter</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:mt-3 sm:text-3xl">
                      {boat.name}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">{boat.subtitle}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-700 md:rounded-3xl md:bg-white md:px-4 md:shadow-sm">
                      <p className="text-[11px] tracking-[0.22em] text-slate-400 uppercase">Capacity</p>
                      <p className="mt-1.5 font-semibold md:mt-2">{boat.capacity}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-700 md:rounded-3xl md:bg-white md:px-4 md:shadow-sm">
                      <p className="text-[11px] tracking-[0.22em] text-slate-400 uppercase">Rates</p>
                      <p className="mt-1.5 font-semibold leading-snug md:mt-2">
                        <span className="block">{boat.hourly}</span>
                        <span className="mt-0.5 block text-slate-500">{boat.daily}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {boat.features.map((feature) => (
                      <span
                        key={feature}
                        className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 md:bg-white"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-950">
                    View details
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
