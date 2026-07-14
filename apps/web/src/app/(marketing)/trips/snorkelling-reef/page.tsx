"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import CountUp from "@/components/marketing/count-number";
import { primaryButtonClass, invertedButtonClass } from "@/components/marketing/button";
import { eyebrowClass, sectionTitleClass, cardTitleClass, smallClass } from "@/components/marketing/typography";
import { publicPath } from "@/lib/paths";

const fadeUp = {
    initial: { y: 40, opacity: 0 },
    whileInView: { y: 0, opacity: 1 },
    viewport: { once: true },
    transition: { type: "spring", stiffness: 320, damping: 70, mass: 1 },
} as const;

const itinerary = [
    {
        num: "1",
        title: "Depart from Mombasa Beach",
        desc: "Step aboard at Mombasa Beach — your captain and crew will brief you on snorkelling safety before casting off toward the reef.",
    },
    {
        num: "2",
        title: "Cruise to the reef",
        desc: "The boat glides across the clear waters of the Mombasa Marine Park. Keep an eye out for dolphins and sea turtles along the way.",
    },
    {
        num: "3",
        title: "Snorkelling session",
        desc: "Gear up and jump into the crystal-clear waters. Explore vibrant coral gardens, swim alongside tropical fish, and discover the underwater world of the Kenyan coast.",
    },
    {
        num: "4",
        title: "Relax and return",
        desc: "Dry off, enjoy a cold drink on deck, and cruise back to Mombasa Beach with stories of the reef and plenty of photos.",
    },
];

const safetyItems = [
    "Life jackets for all passengers",
    "GPS navigation system",
    "CCTV surveillance",
    "Experienced captain with 20+ years experience",
    "Fully insured & certified",
    "European safety standards",
];

const offers = [
    "10% OFF couple bookings",
    "20% OFF group/family bookings (4+ paying passengers)",
    "50% OFF children 5-15",
    "FREE under 5 years",
];

const stats = [
    { value: 2, suffix: "", label: "Hours Duration" },
    { value: 14, suffix: "+", label: "Guests Max" },
    { value: 100, suffix: "%", label: "Safety Certified" },
    { value: 4.9, suffix: "", label: "Guest Rating" },
];

export default function SnorkellingReefPage() {
    return (
        <main className="bg-background text-foreground">
            {/* ============================================
                  FULL SCREEN HERO
            ============================================ */}
            <section className="relative min-h-screen w-full overflow-hidden bg-black">
                <motion.div
                    className="absolute inset-0"
                    initial={{ scale: 1.12 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    <motion.div
                        className="absolute inset-0 h-full w-full bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url('${publicPath("/assets/snorkling-adventure.webp")}')` }}
                        initial={{ scale: 1 }}
                        animate={{ scale: 1.08 }}
                        transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
                    />
                </motion.div>

                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                <motion.div
                    className="container-page relative z-10 flex min-h-screen flex-col justify-center pt-28 pb-16"
                    initial="hidden"
                    animate="show"
                    variants={{
                        hidden: {},
                        show: { transition: { staggerChildren: 0.14, delayChildren: 0.35 } },
                    }}
                >
                    <motion.div variants={{
                        hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
                        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                    }} className="mb-6 flex items-center gap-4">
                        <span className="h-px w-8 bg-white/30" aria-hidden />
                        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">
                            Snorkelling Reef • Mombasa, Kenya
                        </span>
                    </motion.div>

                    <motion.h1
                        className="max-w-[15ch] text-4xl font-medium leading-[1.08] tracking-[-0.02em] text-zinc-50 sm:text-5xl lg:text-6xl"
                        variants={{
                            hidden: {},
                            show: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } },
                        }}
                    >
                        <span className="block overflow-hidden">
                            <motion.span className="block" variants={{
                                hidden: { opacity: 0, y: 64 },
                                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 26, mass: 1 } },
                            }}>
                                Snorkelling
                            </motion.span>
                        </span>
                        <span className="block overflow-hidden">
                            <motion.span className="block" variants={{
                                hidden: { opacity: 0, y: 64 },
                                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 26, mass: 1 } },
                            }}>
                                Reef
                            </motion.span>
                        </span>
                        <span className="block overflow-hidden">
                            <motion.span className="block" variants={{
                                hidden: { opacity: 0, y: 64 },
                                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 26, mass: 1 } },
                            }}>
                                Adventure
                            </motion.span>
                        </span>
                    </motion.h1>

                    <motion.p variants={{
                        hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
                        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                    }} className="mt-6 max-w-[420px] text-pretty text-sm leading-relaxed text-white/60 sm:text-base">
                        Dive into the crystal-clear waters of the Mombasa Marine Park and discover vibrant coral gardens and tropical marine life.
                    </motion.p>

                    <motion.div variants={{
                        hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
                        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                    }} className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
                        <a
                            href="https://wa.me/254708485978?text=Hi%20Blue%20Pineapple%2C%20I'd%20like%20to%20book%20the%20Snorkelling%20Reef"
                            className="group inline-flex items-center gap-2 rounded-full bg-cyan-950 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-cyan-900"
                        >
                            Reserve spot
                        </a>
                        <Link href="#itinerary" className="group inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white">
                            View itinerary
                            <ArrowUpRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                    </motion.div>

                    <motion.div variants={{
                        hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
                        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                    }} className="mt-8 flex items-baseline gap-2">
                        <span className="text-4xl font-medium text-white">Ksh 2,000</span>
                        <span className="text-sm text-white/60">Per Person</span>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6, duration: 0.8 }}
                >
                    <span className="text-[11px] font-medium uppercase tracking-[0.25em]">Scroll</span>
                    <motion.span
                        animate={{ y: [0, 6, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <ArrowDown size={16} />
                    </motion.span>
                </motion.div>
            </section>

            {/* ============================================
                  TRUST NUMBERS
            ============================================ */}
            <section className="py-16 md:py-20 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-white">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            className="flex flex-col items-center text-center"
                            initial={{ y: 30, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                        >
                            <span className="text-4xl md:text-5xl text-zinc-900 leading-none">
                                <CountUp from={0} to={stat.value} />{stat.suffix}
                            </span>
                            <span className="text-xs md:text-sm text-zinc-500 mt-3 uppercase tracking-widest">
                                {stat.label}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ============================================
                  ITINERARY
            ============================================ */}
            <section id="itinerary" className="py-20 md:py-28 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div className="max-w-2xl" {...fadeUp}>
                        <div className="flex items-center gap-1.5">
                            <span className="size-1.5 bg-zinc-900" />
                            <span className={eyebrowClass + " text-zinc-900"}>Itinerary</span>
                        </div>
                        <h2 className={`mt-5 ${sectionTitleClass} text-zinc-900`}>
                            Your reef adventure
                        </h2>
                    </motion.div>

                    <div className="mt-12 relative">
                        <div className="absolute left-4 top-0 bottom-0 w-px bg-zinc-200" />
                        <div className="flex flex-col gap-8">
                            {itinerary.map((item, i) => (
                                <motion.div
                                    key={i}
                                    className="relative flex gap-6 pl-12"
                                    initial={{ y: 30, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                                >
                                    <div className="absolute left-2.5 w-3 h-3 rounded-full bg-cyan-950 border-2 border-white" />
                                    <div className="flex-1">
                                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Step {item.num}</span>
                                        <h3 className={cardTitleClass + " text-zinc-900 mt-1"}>{item.title}</h3>
                                        <p className={smallClass + " mt-1"}>{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================
                  SAFETY & COMFORT
            ============================================ */}
            <section className="py-20 md:py-28 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-zinc-50">
                <div className="max-w-7xl mx-auto">
                    <motion.div className="max-w-2xl" {...fadeUp}>
                        <div className="flex items-center gap-1.5">
                            <span className="size-1.5 bg-zinc-900" />
                            <span className={eyebrowClass + " text-zinc-900"}>Safety & Comfort</span>
                        </div>
                        <h2 className={`mt-5 ${sectionTitleClass} text-zinc-900`}>
                            Safety first, always
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                        {safetyItems.map((item, i) => (
                            <motion.div
                                key={i}
                                className="flex items-center gap-3 bg-white rounded-xl p-5"
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                            >
                                <div className="w-2 h-2 rounded-full bg-cyan-950 shrink-0" />
                                <span className="text-sm text-zinc-700">{item}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================
                  AVAILABLE OFFERS
            ============================================ */}
            <section className="py-20 md:py-28 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div className="max-w-2xl" {...fadeUp}>
                        <div className="flex items-center gap-1.5">
                            <span className="size-1.5 bg-zinc-900" />
                            <span className={eyebrowClass + " text-zinc-900"}>Available Offers</span>
                        </div>
                        <h2 className={`mt-5 ${sectionTitleClass} text-zinc-900`}>
                            Special rates for every group
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
                        {offers.map((offer, i) => (
                            <motion.div
                                key={i}
                                className="bg-zinc-50 rounded-xl p-6 border border-zinc-100"
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                            >
                                <span className="text-sm font-medium text-zinc-900">{offer}</span>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div className="mt-10 flex flex-wrap gap-4" {...fadeUp}>
                        <a
                            href="https://wa.me/254708485978?text=Hi%20Blue%20Pineapple%2C%20I'd%20like%20to%20book%20the%20Snorkelling%20Reef"
                            className={primaryButtonClass}
                        >
                            Book Now
                            <ArrowUpRight size={16} />
                        </a>
                        <Link href="/trips" className={invertedButtonClass}>
                            All Trips
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ============================================
                  FINAL CTA
            ============================================ */}
            <section className="relative py-36 px-4 md:px-16 lg:px-24 xl:px-32 w-full overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src={publicPath("/assets/set.webp")}
                        alt="Sunset coastal experience"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center">
                    <motion.h2
                        className="text-3xl md:text-4xl text-white tracking-tight max-w-[520px] mb-3 font-medium"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
                    >
                        Ready to explore the reef?
                    </motion.h2>
                    <motion.p
                        className="text-white/70 text-sm md:text-base max-w-[400px] mb-7"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        WhatsApp us to reserve your spot on the snorkelling reef adventure.
                    </motion.p>
                    <motion.div
                        className="flex flex-wrap items-center justify-center gap-4"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        <a
                            href="https://wa.me/254708485978?text=Hi%20Blue%20Pineapple%2C%20I'd%20like%20to%20book%20the%20Snorkelling%20Reef"
                            className={primaryButtonClass}
                        >
                            Reserve Spot
                            <ArrowUpRight size={16} />
                        </a>
                        <Link href="/trips" className={invertedButtonClass}>
                            All Trips
                        </Link>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}
