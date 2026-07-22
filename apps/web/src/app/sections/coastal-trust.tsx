"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ShieldCheck, Navigation, Camera, Users, Plus, Minus } from "lucide-react";
import { publicPath } from "@/lib/paths";

const defaultImage = publicPath("/assets/hunky11.webp");

const trustItems = [
    {
        title: "Modern Fleet",
        description: "Fully equipped boats maintained for comfort, safety, and reliable coastal experiences.",
        icon: <Users className="size-4 text-zinc-700" />,
        image: publicPath("/assets/hunky11.webp"),
    },
    {
        title: "Fully Insured",
        description: "Certified and insured vessels so every trip feels secure from departure to return.",
        icon: <ShieldCheck className="size-4 text-zinc-700" />,
        image: publicPath("/assets/fleet.webp"),
    },
    {
        title: "GPS Navigation",
        description: "Navigation-ready vessels supported by clear route planning and local sea knowledge.",
        icon: <Navigation className="size-4 text-zinc-700" />,
        image: publicPath("/assets/hunky11.webp"),
    },
    {
        title: "24/7 Surveillance",
        description: "Enhanced security systems and operational oversight for safer guest experiences.",
        icon: <Camera className="size-4 text-zinc-700" />,
        image: publicPath("/assets/surveillance.webp"),
    },
    {
        title: "Expert Captains",
        description: "Experienced captains who understand the coastline, routes, tides, and guest safety.",
        icon: <Users className="size-4 text-zinc-700" />,
        image: publicPath("/assets/crew.webp"),
    },
];

function TrustImage({ openIndex }: { readonly openIndex: number | null }) {
    return (
        <motion.div
            className="relative aspect-[4/3] w-full max-w-full overflow-hidden rounded-xl bg-zinc-100 shadow-sm md:aspect-auto md:h-[25.6875rem] md:w-[30.375rem]"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
        >
            <Image
                src={defaultImage}
                alt="Modern Fleet"
                width={486}
                height={411}
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-in-out ${
                    openIndex === null ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
                }`}
            />
            {trustItems.map((item, index) => (
                <Image
                    key={item.title}
                    src={item.image}
                    alt={item.title}
                    width={486}
                    height={411}
                    className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-in-out ${
                        openIndex === index ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
                    }`}
                />
            ))}
        </motion.div>
    );
}

export function CoastalTrust() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="w-full bg-white px-4 py-16 sm:px-6 md:px-16 md:py-25 lg:px-24 xl:px-32">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
                {/* Mobile: image + intro first */}
                <div className="flex flex-col md:hidden">
                    <motion.div
                        className="flex items-center gap-1.5"
                        initial={{ y: -20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        <span className="size-1.5 bg-zinc-900" />
                        <span className="text-sm text-zinc-900">TRUST & STANDARDS</span>
                    </motion.div>
                    <motion.h2
                        className="mt-4 max-w-md text-3xl font-medium leading-tight tracking-tight text-zinc-900"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
                    >
                        Why choose Blue Pineapple
                    </motion.h2>
                    <motion.p
                        className="mt-4 mb-6 max-w-md text-base leading-relaxed text-zinc-500"
                        initial={{ y: 30, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        Clean boats, clear pricing, experienced crew, and safety-first operations for premium coastal experiences along the Kenyan coast.
                    </motion.p>
                    <TrustImage openIndex={openIndex} />
                </div>

                {/* Accordion column */}
                <div className="flex flex-col">
                    <div className="hidden md:block">
                        <motion.div
                            className="flex items-center gap-1.5"
                            initial={{ y: -20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                        >
                            <span className="size-1.5 bg-zinc-900" />
                            <span className="text-sm text-zinc-900">TRUST & STANDARDS</span>
                        </motion.div>
                        <motion.h2
                            className="mt-4 max-w-md text-3xl font-medium leading-tight tracking-tight text-zinc-900 md:text-4xl"
                            initial={{ y: 50, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
                        >
                            Why choose Blue Pineapple
                        </motion.h2>
                    </div>

                    <div className="mt-8 flex w-full flex-col gap-3 md:mt-16 md:gap-4">
                        {trustItems.map((item, index) => {
                            const isOpen = openIndex === index;
                            return (
                                <motion.div
                                    key={item.title}
                                    className="overflow-hidden rounded-lg border border-zinc-200/80 bg-white"
                                    initial={{ y: 40, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.08, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setOpenIndex(isOpen ? null : index)}
                                        className="flex w-full cursor-pointer items-center justify-between p-4 text-left transition hover:bg-zinc-50/30 md:px-6 md:py-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div>{item.icon}</div>
                                            <span className="text-sm text-zinc-700 md:text-base">{item.title}</span>
                                        </div>
                                        {isOpen ? (
                                            <Minus className="size-4 shrink-0 text-zinc-700" />
                                        ) : (
                                            <Plus className="size-4 shrink-0 text-zinc-700" />
                                        )}
                                    </button>

                                    <div
                                        className={`grid transition-all duration-300 ease-in-out ${
                                            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                        }`}
                                    >
                                        <div className="overflow-hidden">
                                            <p className="bg-zinc-50/10 p-4 pt-0 text-sm leading-relaxed text-zinc-500 md:px-10">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Desktop right column */}
                <div className="hidden flex-col justify-between md:flex">
                    <motion.p
                        className="mb-8 max-w-md text-base leading-relaxed text-zinc-500 md:mt-20 md:text-lg"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        Clean boats, clear pricing, experienced crew, and safety-first operations for premium coastal experiences along the Kenyan coast.
                    </motion.p>
                    <TrustImage openIndex={openIndex} />
                </div>
            </div>
        </section>
    );
}
