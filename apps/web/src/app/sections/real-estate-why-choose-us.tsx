"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Compass, ShieldCheck, Sparkles, Plus, Minus, Navigation, Users } from "lucide-react";
import { publicPath } from "@/lib/paths";

const houseImage = publicPath("/assets/galleryImage3.webp");

const whyChooseUsData = [
    {
        title: "What makes Blue Pineapple different?",
        description: "We combine premium properties, transparent transactions, and deep local expertise to deliver real estate experiences that feel effortless, trustworthy, and rewarding.",
        icon: <Sparkles className="size-4 text-zinc-700" />,
        image: publicPath("/assets/galleryImage3.webp"),
    },
    {
        title: "Are your properties verified?",
        description: "Yes. We conduct thorough due diligence on titles, permits, and compliance so every property is secure, documented, and ready for investment.",
        icon: <ShieldCheck className="size-4 text-zinc-700" />,
        image: publicPath("/assets/crew1.webp"),
    },
    {
        title: "What investment opportunities exist?",
        description: "From land banking and holiday homes to commercial developments and residential projects, we curate opportunities that match your financial goals and risk profile.",
        icon: <Navigation className="size-4 text-zinc-700" />,
        image: publicPath("/assets/location.webp"),
    },
    {
        title: "Can I schedule a viewing?",
        description: "Yes. We arrange guided viewings and virtual tours for local and international clients, coordinating every detail for a seamless experience.",
        icon: <Compass className="size-4 text-zinc-700" />,
        image: publicPath("/assets/hunky04.webp"),
    },
    {
        title: "How do I start the buying process?",
        description: "Getting started is simple. Contact us via phone, email, or the contact form and we will guide you through selection, negotiation, and completion.",
        icon: <Users className="size-4 text-zinc-700" />,
        image: publicPath("/assets/crew.webp"),
    },
    {
        title: "What payment plans are available?",
        description: "We offer flexible payment options tailored to your needs, including installment plans and phased completion arrangements where available.",
        icon: <ShieldCheck className="size-4 text-zinc-700" />,
        image: publicPath("/assets/site.webp"),
    },
    {
        title: "Do you offer property management?",
        description: "Yes. Our property management service handles tenant sourcing, rent collection, maintenance, and reporting so your investment continues to perform smoothly.",
        icon: <Sparkles className="size-4 text-zinc-700" />,
        image: publicPath("/assets/galleryImage1.webp"),
    },
];

export function RealEstateWhyChooseUs() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-16 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-white">
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
                        Our commitment, philosophy, and approach to every client
                    </motion.h2>

                    {/* Accordion List */}
                    <div className="flex flex-col gap-4 mt-12 md:mt-16 w-full">
                        {whyChooseUsData.map((item, index) => {
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

                                    {/* Expandable Description (CSS Grid Transition for smooth open/close) */}
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
                        We don’t just sell property — we build relationships, create investment opportunities, and help clients achieve financial growth through informed decisions.
                    </motion.p>
                    
                    <motion.div className="relative w-121.5 h-102.75 rounded-xl overflow-hidden shadow-sm bg-zinc-100 max-w-full" 
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        {/* Default Image */}
                        <Image src={houseImage} alt="Real Estate Property" width={486} height={411}
                            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out ${
                                openIndex === null ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                            }`}
                        />
                        {/* Accordion-specific images */}
                        {whyChooseUsData.map((item, index) => (
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
