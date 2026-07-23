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
        image: publicPath("/assets/coastaltrust/insured.webp"),
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
        image: publicPath("/assets/coastaltrust/surv.webp"),
    },
    {
        title: "Expert Captains",
        description: "Experienced captains who understand the coastline, routes, tides, and guest safety.",
        icon: <Users className="size-4 text-zinc-700" />,
        image: publicPath("/assets/coastaltrust/captains.webp"),
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
                {/* Mobile: intro only — no separate image block, it now lives inside each accordion item */}
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
                        className="mt-4 max-w-md text-base leading-relaxed text-zinc-500"
                        initial={{ y: 30, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        Clean boats, clear pricing, experienced crew, and safety-first operations for premium coastal experiences along the Kenyan coast.
                    </motion.p>
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

                    {/* Single bordered container with dividers, instead of 5 separately-bordered boxes */}
                    <motion.div
                        className="mt-8 w-full overflow-hidden rounded-xl border border-zinc-200/80 md:mt-16 md:rounded-2xl"
                        initial={{ y: 40, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        {trustItems.map((item, index) => {
                            const isOpen = openIndex === index;
                            return (
                                <div
                                    key={item.title}
                                    className={index === 0 ? "" : "border-t border-zinc-200/80"}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setOpenIndex(isOpen ? null : index)}
                                        className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left transition hover:bg-zinc-50/60 md:px-6 md:py-5"
                                    >
                                        <div className="flex items-center gap-3.5 md:gap-4">
                                            <div className="shrink-0">{item.icon}</div>
                                            <span className="text-sm font-medium text-zinc-800 md:text-base md:font-normal md:text-zinc-700">
                                                {item.title}
                                            </span>
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
                                            {/* Mobile: image + description reveal together, in place, right where the user tapped */}
                                            <div className="flex flex-col gap-4 px-5 pb-5 md:hidden">
                                                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-zinc-100">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.title}
                                                        fill
                                                        sizes="(max-width: 768px) 100vw, 0px"
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <p className="text-sm leading-relaxed text-zinc-500">
                                                    {item.description}
                                                </p>
                                            </div>

                                            {/* Desktop: text only — the shared image sits in the sticky right column */}
                                            <p className="hidden text-sm leading-relaxed text-zinc-500 md:block md:px-10 md:pb-5">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
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