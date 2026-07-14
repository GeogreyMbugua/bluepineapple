"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import CountUp from "@/components/marketing/count-number";
import { primaryButtonClass, invertedButtonClass } from "@/components/marketing/button";
import { eyebrowClass, sectionTitleClass, bodyClass, cardTitleClass, smallClass } from "@/components/marketing/typography";
import { publicPath } from "@/lib/paths";
import { CoastalVideo } from "@/components/marketing/coastal-video";

const fadeUp = {
    initial: { y: 40, opacity: 0 },
    whileInView: { y: 0, opacity: 1 },
    viewport: { once: true },
    transition: { type: "spring", stiffness: 320, damping: 70, mass: 1 },
} as const;

const fares = [
    { stops: "1 stop", price: "KES 500" },
    { stops: "2 stops", price: "KES 750" },
    { stops: "3 stops", price: "KES 1,000" },
    { stops: "Full route (8 stops)", price: "KES 3,000" },
];

const timetable = [
    { stop: "Depart Mtwapa Beach", time: "9:30 AM daily" },
    { stop: "Arrive Mombasa Beach", time: "10:30 AM" },
    { stop: "Arrive Fort Jesus", time: "11:30 AM" },
];

const itinerary = [
    {
        num: "1",
        title: "Depart from Mombasa Beach",
        desc: "Step aboard at Mombasa Beach — your captain and crew will brief you on safety before casting off. Life jackets are distributed and the GPS system is confirmed active.",
    },
    {
        num: "2",
        title: "Cruise past Nyali Beach",
        desc: "The boat hugs the coastline past Nyali's white-sand shores. A great moment to settle in, take photos, and feel the ocean breeze.",
    },
    {
        num: "3",
        title: "Pass Mombasa Marine Park",
        desc: "Glide over the crystal-clear waters of Mombasa Marine Park. Keep an eye out for marine life — turtles and reef fish are commonly spotted here.",
    },
    {
        num: "4",
        title: "View Likoni & Shelly Beach",
        desc: "From the water you'll spot the Likoni ferry crossing, Ras Serani Lighthouse, State House, and Mombasa Hospital.",
    },
    {
        num: "5",
        title: "Arrive at Fort Jesus Harbour",
        desc: "Dock at the historic harbour beneath the imposing walls of Fort Jesus. Built by the Portuguese in 1593, the fort commands panoramic views of the old harbour.",
    },
    {
        num: "6",
        title: "Explore Old Town",
        desc: "Step into Old Town's winding streets lined with carved Swahili doorways, antique shops, and the smell of Kenyan coastal spices. ~1 hr ashore.",
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
    { value: 6, suffix: "+", label: "Journey Stops" },
    { value: 8, suffix: "", label: "Hours Experience" },
    { value: 1593, suffix: "", label: "Historic Fort" },
    { value: 100, suffix: "%", label: "Safety Certified" },
];

export default function FortJesusTrip() {
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
                        style={{ backgroundImage: `url('${publicPath("/assets/fort.webp")}')` }}
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
                            Fort Jesus Historical Boat Tour
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
                                Fort Jesus
                            </motion.span>
                        </span>
                        <span className="block overflow-hidden">
                            <motion.span className="block" variants={{
                                hidden: { opacity: 0, y: 64 },
                                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 26, mass: 1 } },
                            }}>
                                Historical Boat Tour
                            </motion.span>
                        </span>
                        <span className="block overflow-hidden">
                            <motion.span className="block" variants={{
                                hidden: { opacity: 0, y: 64 },
                                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 26, mass: 1 } },
                            }}>
                                from Mombasa
                            </motion.span>
                        </span>
                    </motion.h1>

                    <motion.p variants={{
                        hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
                        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                    }} className="mt-6 max-w-[420px] text-pretty text-sm leading-relaxed text-white/60 sm:text-base">
                        A premium coastal cruise to Fort Jesus with iconic views and time to explore Old Town.
                    </motion.p>

                    <motion.div variants={{
                        hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
                        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                    }} className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
                        <a
                            href="https://wa.me/254708485978?text=Hi%20Blue%20Pineapple%2C%20I'd%20like%20to%20book%20the%20Fort%20Jesus"
                            className="group inline-flex items-center gap-2 rounded-full bg-cyan-950 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-cyan-900"
                        >
                            Reserve spot
                        </a>
                        <Link href="#route-fares" className="group inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white">
                            View route & fares
                            <ArrowUpRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                    </motion.div>

                    <motion.div variants={{
                        hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
                        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                    }} className="mt-8 flex items-baseline gap-2">
                        <span className="text-4xl font-medium text-white">Ksh 500</span>
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
                  THE JOURNEY
            ============================================ */}
            <section className="py-20 md:py-28 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-white">
                <div className="max-w-5xl mx-auto">
                    <motion.div className="flex items-center gap-1.5 mb-8" {...fadeUp}>
                        <span className="size-1.5 bg-zinc-900" />
                        <span className={eyebrowClass + " text-zinc-900"}>
                            THE JOURNEY
                        </span>
                    </motion.div>
                    <motion.div
                        initial={{ y: 50, opacity: 0, scale: 0.96 }}
                        whileInView={{ y: 0, opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15, type: "spring", stiffness: 240, damping: 70, mass: 1 }}
                        className="relative rounded-2xl overflow-hidden bg-zinc-900"
                    >
                        <CoastalVideo
                            sources={[
                                { src: "/assets/video/bluep9.webm", type: "webm" },
                                { src: "/assets/video/bluep9.mp4", type: "mp4" },
                            ]}
                            poster="/assets/galleryImage1.webp"
                            className="w-full aspect-video"
                            controls
                            preload="metadata"
                        />
                    </motion.div>
                    <motion.p className="text-zinc-500 text-sm mt-4 text-center" {...fadeUp}>
                        Watch the full Fort Jesus experience — from Mombasa Beach to Old Town and back.
                    </motion.p>
                </div>
            </section>

            {/* ============================================
                  ROUTE & FARES
            ============================================ */}
            <section id="route-fares" className="py-20 md:py-28 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-zinc-50">
                <div className="max-w-7xl mx-auto">
                    <motion.div className="max-w-2xl" {...fadeUp}>
                        <div className="flex items-center gap-1.5">
                            <span className="size-1.5 bg-zinc-900" />
                            <span className={eyebrowClass + " text-zinc-900"}>Route & Fares</span>
                        </div>
                        <h2 className={`mt-5 ${sectionTitleClass} text-zinc-900`}>
                            Hop-On. Hop-Off. Your Coast.
                        </h2>
                        <p className={`mt-3 ${bodyClass}`}>
                            Board anywhere from Mtwapa Beach to Fort Jesus. See stops, timetable, and live fare estimate.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                        {fares.map((fare, i) => (
                            <motion.div
                                key={i}
                                className="bg-white rounded-xl p-6 flex flex-col gap-1"
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                            >
                                <span className="text-xs text-zinc-500 uppercase tracking-wider">{fare.stops}</span>
                                <span className="text-xl font-medium text-zinc-900">{fare.price}</span>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div className="mt-12 bg-white rounded-xl p-6 md:p-8" {...fadeUp}>
                        <h3 className={cardTitleClass + " text-zinc-900 mb-4"}>Timetable preview</h3>
                        <div className="flex flex-col gap-3">
                            {timetable.map((item, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                                    <span className="text-sm text-zinc-600">{item.stop}</span>
                                    <span className="text-sm font-medium text-zinc-900">{item.time}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
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
                            Your route
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
            <section id="safety" className="py-20 md:py-28 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-zinc-50">
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
                            href="https://wa.me/254708485978?text=Hi%20Blue%20Pineapple%2C%20I'd%20like%20to%20book%20the%20Fort%20Jesus"
                            className={primaryButtonClass}
                        >
                            Book Now
                            <ArrowUpRight size={16} />
                        </a>
                        <a
                            href="https://wa.me/254708485978?text=Hi%20Blue%20Pineapple%2C%20I%20have%20a%20question%20about%20Fort%20Jesus"
                            className={invertedButtonClass}
                        >
                            Ask a Question
                        </a>
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
                        Ready to Experience Fort Jesus?
                    </motion.h2>
                    <motion.p
                        className="text-white/70 text-sm md:text-base max-w-[400px] mb-7"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        Board from Mtwapa Beach and discover the historic coast in style.
                    </motion.p>
                    <motion.div
                        className="flex flex-wrap items-center justify-center gap-4"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        <a
                            href="https://wa.me/254708485978?text=Hi%20Blue%20Pineapple%2C%20I'd%20like%20to%20book%20the%20Fort%20Jesus"
                            className={primaryButtonClass}
                        >
                            Reserve Spot
                            <ArrowUpRight size={16} />
                        </a>
                        <Link href="/coastal-experiences" className={invertedButtonClass}>
                            All Experiences
                        </Link>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}
