"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { publicPath } from "@/lib/paths";

const experiences = [
    {
        title: "Creek Safaris / Mangrove",
        category: "leisure",
        duration: "3 hours",
        vessel: "Glass-bottomed Boat",
        location: "Mombasa",
        price: "Ksh 4,000/pax",
        image: publicPath("/assets/creek-safaris.webp"),
        href: "/trips/creek-safaris-mangrove",
    },
    {
        title: "Fort Jesus",
        category: "cultural",
        duration: "8 hours",
        vessel: "Big Boat",
        location: "Mombasa",
        price: "From Ksh 500",
        image: publicPath("/assets/fort.webp"),
        href: "/trips/fort-jesus-trip",
    },
    {
        title: "Sunset",
        category: "leisure",
        duration: "2h 30m",
        vessel: "",
        location: "Mombasa",
        price: "Ksh 3,000/pax",
        image: publicPath("/assets/set.webp"),
        href: "/trips/sunset-sailing",
    },
    {
        title: "Birthdays & Anniversaries",
        category: "family",
        duration: "2 hours",
        vessel: "",
        location: "Mombasa",
        price: "Ksh 2,000/pax",
        image: publicPath("/assets/events.webp"),
        href: "/trips/birthdays-anniversaries",
    },
    {
        title: "Snorkelling Reef",
        category: "adventure",
        duration: "2 hours",
        vessel: "",
        location: "Mombasa",
        price: "Ksh 2,000/pax",
        image: publicPath("/assets/snorkling-adventure.webp"),
        href: "/trips/snorkelling-reef",
    },
];

export function CoastalExperiences() {
    return (
        <section id="experiences" className="w-full bg-cyan-50 px-4 py-16 sm:px-6 md:px-16 md:py-25 lg:px-24 xl:px-32">
            <div className="mx-auto max-w-7xl">
                <motion.div
                    className="flex items-center gap-1.5"
                    initial={{ y: -20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                    <span className="size-1.5 bg-zinc-900" />
                    <span className="text-sm text-zinc-900">EXPERIENCES</span>
                </motion.div>
                <motion.h2
                    className="mt-4 max-w-2xl text-3xl font-medium leading-tight tracking-tight text-zinc-900 md:text-4xl"
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
                >
                    Explore all trips
                </motion.h2>
                <motion.p
                    className="mt-3 max-w-2xl text-sm text-zinc-500 md:text-base"
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                    Browse premium coastal experiences in Mombasa — from Fort Jesus harbour routes to reef snorkelling, mangrove safaris, sunset sailings and private charters.
                </motion.p>

                <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                    {experiences.map((exp, index) => (
                        <motion.div
                            key={exp.href}
                            initial={{ y: 40, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                        >
                            <Link
                                href={exp.href}
                                className="group block overflow-hidden rounded-2xl border border-zinc-100 bg-white transition-shadow duration-300 hover:shadow-lg"
                            >
                                <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
                                    <Image
                                        src={exp.image}
                                        alt={exp.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute top-3 left-3">
                                        <span className="inline-block rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-zinc-700 uppercase backdrop-blur-sm">
                                            {exp.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2.5 p-5">
                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                                        <h3 className="text-base font-medium text-zinc-900">{exp.title}</h3>
                                        <span className="shrink-0 text-xs text-zinc-500">{exp.duration}</span>
                                    </div>
                                    <div className="flex flex-col gap-1.5 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
                                        <span>
                                            {exp.location}
                                            {exp.vessel ? ` • ${exp.vessel}` : ""}
                                        </span>
                                        <span className="text-sm font-semibold text-zinc-900">{exp.price}</span>
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
