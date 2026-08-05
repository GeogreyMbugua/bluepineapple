"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Clock3, MapPin } from "lucide-react";
import { publicPath } from "@/lib/paths";

const experiences = [
  {
    title: "Creek Safaris",
    category: "Leisure",
    duration: "3 hours",
    vessel: "Glass-bottomed Boat",
    location: "Mombasa",
    price: "Ksh 4,000/pax",
    image: publicPath("/assets/experiences/creek/creek1.webp"),
    href: "/trips/creek-safaris-mangrove",
  },
  {
    title: "Fort Jesus",
    category: "Cultural",
    duration: "8 hours",
    vessel: "Big Boat",
    location: "Mombasa",
    price: "From Ksh 500",
    image: publicPath("/assets/experiences/fortjesus/fortstock.webp"),
    href: "/trips/fort-jesus-trip",
  },
  {
    title: "Sunset",
    category: "Leisure",
    duration: "2h 30m",
    vessel: "",
    location: "Mombasa",
    price: "Ksh 3,000/pax",
    image: publicPath("/assets/experiences/sunset/sunset1.webp"),
    href: "/trips/sunset-sailing",
  },
  {
    title: "Birthdays & Anniversaries",
    category: "Family",
    duration: "2 hours",
    vessel: "",
    location: "Mombasa",
    price: "Ksh 2,000/pax",
    image: publicPath("/assets/experiences/events/event1.webp"),
    href: "/trips/birthdays-anniversaries",
  },
  {
    title: "Snorkelling Reef",
    category: "Adventure",
    duration: "2 hours",
    vessel: "",
    location: "Mombasa",
    price: "Ksh 2,000/pax",
    image: publicPath("/assets/experiences/snorkeling/snorkeling.webp"),
    href: "/trips/snorkelling-reef",
  },
];

export function CoastalExperiences() {
  return (
    <section
      id="experiences"
      className="bg-white py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .5 }}
          className="max-w-3xl"
        >
          <div className="flex items-center gap-2">
            <span className="h-px w-8 bg-zinc-900" />
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-zinc-600">
              Experiences
            </span>
          </div>

          <h2 className="mt-5 text-4xl font-medium tracking-tight text-zinc-900 md:text-5xl">
            Explore all trips
          </h2>

          <p className="mt-4 text-lg leading-relaxed text-zinc-600">
            Browse premium coastal experiences in Mombasa — from Fort Jesus
            harbour routes to reef snorkelling, mangrove safaris, sunset
            sailings and private charters.
          </p>
        </motion.div>

        {/* Grid */}

        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

          {experiences.map((exp, index) => (

            <motion.div
              key={exp.href}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.08,
                duration: .45,
              }}
            >
              <Link
                href={exp.href}
                className="group block"
              >
                {/* Image */}

                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-zinc-100">

                  <Image
                    src={exp.image}
                    alt={exp.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />

                </div>

                {/* Content */}

                <div className="mt-5 space-y-3">

                  <div>

                    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">

                      <span>{exp.category}</span>

                      <span className="h-1 w-1 rounded-full bg-zinc-300" />

                      <span className="flex items-center gap-1">

                        <Clock3 className="h-3 w-3" />

                        {exp.duration}

                      </span>

                    </div>

                    <h3 className="mt-2 text-lg font-medium leading-snug text-zinc-900 transition-colors group-hover:text-cyan-700">
                      {exp.title}
                    </h3>

                  </div>

                  <div className="flex items-start gap-2 text-sm text-zinc-500">

                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

                    <span>
                      {exp.location}
                      {exp.vessel && ` • ${exp.vessel}`}
                    </span>

                  </div>

                  <div className="pt-1">

                    <p className="text-xs uppercase tracking-wide text-zinc-400">
                      Starting from
                    </p>

                    <p className="mt-1 text-lg font-semibold text-zinc-900">
                      {exp.price}
                    </p>

                  </div>

                </div>

              </Link>

            </motion.div>

          ))}

        </div>

      </div>
    </section>
  );
}