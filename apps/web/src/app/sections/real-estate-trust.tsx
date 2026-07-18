"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ShieldCheck, Navigation, Camera, Users, Plus, Minus } from "lucide-react";
import { publicPath } from "@/lib/paths";

const defaultImage = publicPath("/assets/galleryImage3.webp");

const trustItems = [
    {
        title: "Verified Properties",
        description: "Every property is carefully vetted with clear documentation, legal checks, and professional due diligence for secure ownership.",
        icon: <Users className="size-4 text-zinc-700" />,
        image: publicPath("/assets/galleryImage3.webp"),
    },
    {
        title: "Transparent Transactions",
        description: "We provide clear pricing, honest guidance, and dependable processes so every transaction feels straightforward and secure.",
        icon: <ShieldCheck className="size-4 text-zinc-700" />,
        image: publicPath("/assets/conso.webp"),
    },
    {
        title: "Prime Locations",
        description: "Our portfolio spans high-growth coastal regions and established urban areas, including Mombasa, Vipingo, Watamu, Diani, and beyond.",
        icon: <Navigation className="size-4 text-zinc-700" />,
        image: publicPath("/assets/location.webp"),
    },
    {
        title: "Investment Guidance",
        description: "We help clients identify opportunities that match their goals, from land banking to vacation rentals and development projects.",
        icon: <Camera className="size-4 text-zinc-700" />,
        image: publicPath("/assets/galleryImage1.webp"),
    },
    {
        title: "End-to-End Support",
        description: "Our seasoned team supports you from property selection and viewings through closing, management, and long-term advisory.",
        icon: <Users className="size-4 text-zinc-700" />,
        image: publicPath("/assets/crew.webp"),
    },
];

export function RealEstateTrust() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-16 md:py-25 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-white">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-24">
                {/* Left Column */}
                <div className="flex flex-col">
                    <motion.div className="flex items-center gap-1.5"
                        initial={{ y: -20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        <span className="size-1.5 bg-zinc-900"></span>
                        <span className="text-sm text-zinc-900">
                            WHY BLUE PINEAPPLE
                        </span>
                    </motion.div>
                    <motion.h2 className="text-3xl md:text-4xl text-zinc-900 mt-4 leading-tight font-medium max-w-md tracking-tight"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
                    >
                        A commitment to trust, value, and long-term growth
                    </motion.h2>

                    {/* Accordion List */}
                    <div className="flex flex-col gap-4 mt-12 md:mt-16 w-full">
                        {trustItems.map((item, index) => {
                            const isOpen = openIndex === index;
                            return (
                                <motion.div key={index} className="bg-white rounded-sm border border-zinc-100/50 overflow-hidden"
                                    initial={{ y: 150, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.15, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                                >
                                    <button onClick={() => setOpenIndex(isOpen ? null : index)} className="w-full flex items-center justify-between p-4 md:py-4 md:px-6 text-left hover:bg-zinc-50/30 transition cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div>
                                                {item.icon}
                                            </div>
                                            <span className="text-sm md:text-base text-zinc-600">
                                                {item.title}
                                            </span>
                                        </div>
                                        <div>
                                            {isOpen ? (
                                                <Minus className="size-4 text-zinc-700" />
                                            ) : (
                                                <Plus className="size-4 text-zinc-700" />
                                            )}
                                        </div>
                                    </button>

                                    {/* Expandable Description */}
                                    <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                                        <div className="overflow-hidden">
                                            <p className="p-4 md:px-10 pt-0 text-xs md:text-sm text-zinc-500 leading-relaxed bg-zinc-50/10">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col justify-between">
                    <motion.p className="text-zinc-500 text-base md:text-lg max-w-md md:mt-20 mb-8 leading-relaxed"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        We believe every client deserves honest advice, exceptional service, and lasting value. We build relationships, create opportunity, and help our clients make informed decisions with confidence.
                    </motion.p>

                    <motion.div className="relative w-121.5 h-102.75 rounded-xl overflow-hidden shadow-sm bg-zinc-100 max-w-full"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        {/* Default Image */}
                        <Image src={defaultImage} alt="Real Estate" width={486} height={411}
                            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out ${
                                openIndex === null ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                            }`}
                        />
                        {/* Accordion-specific images */}
                        {trustItems.map((item, index) => (
                            <Image key={index} src={item.image} alt={item.title} width={486} height={411}
                                className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out ${
                                    openIndex === index ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                                }`}
                            />
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
