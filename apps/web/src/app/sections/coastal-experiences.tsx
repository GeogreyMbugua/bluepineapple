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
        <section id="experiences" className="py-16 md:py-25 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-cyan-50">
            <div className="max-w-7xl mx-auto">
                <motion.div className="flex items-center gap-1.5"
                    initial={{ y: -20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                    <span className="size-1.5 bg-zinc-900"></span>
                    <span className="text-sm text-zinc-900">
                        EXPERIENCES
                    </span>
                </motion.div>
                <motion.h2 className="text-3xl md:text-4xl text-zinc-900 mt-4 leading-tight font-medium max-w-2xl tracking-tight"
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
                >
                    Explore all trips
                </motion.h2>
                <motion.p className="text-zinc-500 text-sm md:text-base mt-3 max-w-2xl"
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                    Browse premium coastal experiences in Mombasa — from Fort Jesus harbour routes to reef snorkelling, mangrove safaris, sunset sailings and private charters.
                </motion.p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                    {experiences.map((exp, index) => (
                        <motion.div
                            key={index}
                            initial={{ y: 40, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                        >
                            <Link href={exp.href} className="group block bg-white rounded-xl overflow-hidden border border-zinc-100 hover:shadow-lg transition-shadow duration-300">
                                <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
                                    <Image src={exp.image} alt={exp.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <div className="absolute top-3 left-3">
                                        <span className="inline-block px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-wider text-zinc-700">
                                            {exp.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-medium text-zinc-900">{exp.title}</h3>
                                        <span className="text-xs text-zinc-500">{exp.duration}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-zinc-500">
                                        <span>{exp.location}{exp.vessel ? ` • ${exp.vessel}` : ""}</span>
                                        <span className="font-medium text-zinc-900">{exp.price}</span>
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
