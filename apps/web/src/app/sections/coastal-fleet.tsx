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
    <section id="fleet" className="bg-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl"
        >
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-600">Our fleet</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            Boats built for unforgettable coastal trips
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Choose the right vessel for your private charter, family outing, or scenic harbour cruise.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {fleet.map((boat) => (
            <motion.article
              key={boat.name}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="group overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 shadow-sm transition hover:shadow-md"
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

                <div className="space-y-5 p-6 sm:p-8">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-cyan-600">Boat charter</p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                      {boat.name}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">{boat.subtitle}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Capacity</p>
                      <p className="mt-2 font-semibold">{boat.capacity}</p>
                    </div>
                    <div className="rounded-3xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Rates</p>
                      <p className="mt-2 font-semibold">{boat.hourly} / {boat.daily}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {boat.features.map((feature) => (
                      <span key={feature} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-950">
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
