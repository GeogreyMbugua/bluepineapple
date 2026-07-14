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
  images: [string, string, string];
  features: string[];
};

const fleet: FleetBoat[] = [
  {
    name: "Setting Sons",
    subtitle: "Luxury Coastal Cruiser",
    capacity: "Up to 35 Guests",
    hourly: "Ksh 8,000/hr",
    daily: "Ksh 32,000/day",
    href: "/boats/setting-sons",
    images: [
      publicPath("/assets/setting.webp"),
      publicPath("/assets/settings.webp"),
      publicPath("/assets/24setting.webp"),
    ],
    features: [
      "Private Charter",
      "Corporate Events",
      "Harbour Cruises",
    ],
  },
  {
    name: "Hunky Dory",
    subtitle: "Glass Bottom Boat",
    capacity: "Up to 14 Guests",
    hourly: "Ksh 5,000/hr",
    daily: "Ksh 20,000/day",
    href: "/boats/hunky-dory",
    images: [
      publicPath("/assets/hunky11.webp"),
      publicPath("/assets/hunky04.webp"),
      publicPath("/assets/galleryImage3.webp"),
    ],
    features: [
      "Glass Bottom",
      "Family Friendly",
      "Marine Viewing",
    ],
  },
];

const imageClass =
  "absolute rounded-3xl object-cover border border-white/20 shadow-2xl transition-all duration-500";

export function CoastalFleet() {
  return (
    <section
      id="fleet"
      className="relative overflow-hidden bg-white py-20 md:py-28 px-4 md:px-16 lg:px-24 xl:px-32"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="flex items-center gap-2"
          initial={{ y: -20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
        >
          <span className="h-2 w-2 rounded-full bg-cyan-600" />
          <span className="text-sm uppercase tracking-[0.25em] text-zinc-500">
            Our Fleet
          </span>
        </motion.div>

        <motion.h2
          className="mt-5 max-w-3xl text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900"
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
        >
          Discover the Blue Pineapple Fleet
        </motion.h2>

        <motion.p
          className="mt-5 max-w-2xl text-zinc-600 leading-7"
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
        >
          Every vessel is carefully maintained for unforgettable coastal
          experiences—from intimate family adventures to large private
          celebrations and corporate charters.
        </motion.p>

        <div className="mt-20 space-y-24">
          {fleet.map((boat, index) => {
            const reverse = index % 2 === 1;

            return (
              <motion.div
                key={boat.name}
                initial={{ y: 60, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 20,
                }}
              >
                <Link
                  href={boat.href}
                  className={`group grid items-center gap-14 lg:grid-cols-2 ${
                    reverse ? "lg:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  {/* COLLAGE */}

                  <div className="relative h-[500px] w-full">
                    <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-cyan-50 to-zinc-100" />

                    <motion.div
                      className="absolute left-6 top-10 h-[320px] w-[58%] -rotate-6 z-20"
                      whileHover={{ y: -5 }}
                    >
                      <Image
                        src={boat.images[0]}
                        fill
                        alt={boat.name}
                        className={`${imageClass} group-hover:-rotate-3 group-hover:-translate-y-2`}
                      />
                    </motion.div>

                    <motion.div
                      className="absolute right-5 top-8 h-[180px] w-[38%] rotate-6 z-30"
                      whileHover={{ y: -5 }}
                    >
                      <Image
                        src={boat.images[1]}
                        fill
                        alt=""
                        className={`${imageClass} group-hover:rotate-3`}
                      />
                    </motion.div>

                    <motion.div
                      className="absolute right-12 bottom-10 h-[210px] w-[48%] rotate-2 z-40"
                      whileHover={{ y: -5 }}
                    >
                      <Image
                        src={boat.images[2]}
                        fill
                        alt=""
                        className={`${imageClass} group-hover:translate-y-2`}
                      />
                    </motion.div>

                    {/* Floating Badge */}

                    <div className="absolute left-10 bottom-10 z-50 rounded-full bg-white/90 backdrop-blur-md px-5 py-3 shadow-xl">
                      <div className="text-xs uppercase tracking-widest text-zinc-500">
                        Capacity
                      </div>

                      <div className="font-semibold text-zinc-900">
                        {boat.capacity}
                      </div>
                    </div>
                  </div>

                  {/* CONTENT */}

                  <div>
                    <span className="text-sm uppercase tracking-[0.3em] text-cyan-600">
                      Premium Charter
                    </span>

                    <h3 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-900">
                      {boat.name}
                    </h3>

                    <p className="mt-2 text-lg text-zinc-500">
                      {boat.subtitle}
                    </p>

                    <p className="mt-8 text-zinc-600 leading-7">
                      Experience the Kenyan coastline aboard{" "}
                      <strong>{boat.name}</strong>, designed for comfort,
                      safety, and unforgettable moments on the water.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                      {boat.features.map((feature) => (
                        <span
                          key={feature}
                          className="rounded-full bg-zinc-100 px-4 py-2 text-sm text-zinc-700"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    <div className="mt-10 flex flex-wrap gap-10">
                      <div>
                        <div className="text-sm text-zinc-500">
                          Hourly Charter
                        </div>

                        <div className="mt-1 text-2xl font-semibold text-zinc-900">
                          {boat.hourly}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-zinc-500">
                          Full Day
                        </div>

                        <div className="mt-1 text-2xl font-semibold text-zinc-900">
                          {boat.daily}
                        </div>
                      </div>
                    </div>

                    <div className="mt-12 inline-flex items-center gap-3 text-cyan-700 font-medium">
                      Explore Vessel

                      <ArrowUpRight
                        className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                        size={18}
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison Table */}

        <motion.div
          className="mt-28 rounded-[32px] border border-zinc-200 bg-zinc-50 p-8 md:p-12"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-semibold text-zinc-900">
            Compare Our Fleet
          </h3>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-zinc-200">
                <tr>
                  <th className="py-4">Feature</th>
                  <th className="py-4">Setting Sons</th>
                  <th className="py-4">Hunky Dory</th>
                </tr>
              </thead>

              <tbody className="text-zinc-600">
                <tr className="border-b border-zinc-100">
                  <td className="py-5">Capacity</td>
                  <td>35 Guests</td>
                  <td>14 Guests</td>
                </tr>

                <tr className="border-b border-zinc-100">
                  <td className="py-5">Hourly Rate</td>
                  <td>Ksh 8,000</td>
                  <td>Ksh 5,000</td>
                </tr>

                <tr className="border-b border-zinc-100">
                  <td className="py-5">Daily Rate</td>
                  <td>Ksh 32,000</td>
                  <td>Ksh 20,000</td>
                </tr>

                <tr className="border-b border-zinc-100">
                  <td className="py-5">Ideal For</td>
                  <td>Corporate Events & Large Groups</td>
                  <td>Families & Sightseeing</td>
                </tr>

                <tr>
                  <td className="py-5">Unique Feature</td>
                  <td>360° Surveillance</td>
                  <td>Glass Bottom Viewing</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}