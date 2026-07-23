"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import CountUp from "@/components/marketing/count-number";
import { primaryButtonClass, invertedButtonClass } from "@/components/marketing/button";
import { eyebrowClass, sectionTitleClass, bodyClass } from "@/components/marketing/typography";
import { publicPath } from "@/lib/paths";

const fadeUp = {
    initial: { y: 40, opacity: 0 },
    whileInView: { y: 0, opacity: 1 },
    viewport: { once: true },
    transition: { type: "spring", stiffness: 320, damping: 70, mass: 1 },
} as const;

const experiences = [
    {
        title: "Fort Jesus",
        subtitle: "Hop on anywhere from Mtwapa Beach to Fort Jesus — like a water matatu along the Mombasa North Coast.",
        category: "cultural",
        duration: "8 hours",
        vessel: "Big Boat",
        location: "Mombasa",
        price: "From Ksh 500",
        image: publicPath("/assets/experiences/fortjesus/fortstock.webp"),
        href: "/trips/fort-jesus-trip",
        featured: true,
        images: [
            publicPath("/assets/experiences/fortjesus/fortstock.webp"),
            publicPath("/assets/experiences/fortjesus/fort2.webp"),
            publicPath("/assets/experiences/fortjesus/fort3.webp"),
        ],
    },
    {
        title: "Creek Safaris / Mangrove",
        subtitle: "Glide through tranquil estuaries like Mtwapa and Tudor Creek aboard a glass-bottomed boat — nature at its best.",
        category: "leisure",
        duration: "3 hours",
        vessel: "Glass-bottomed Boat",
        location: "Mombasa",
        price: "Ksh 4,000/pax",
        image: publicPath("/assets/experiences/creek/creek1.webp"),
        href: "/trips/creek-safaris-mangrove",
        featured: false,
        images: [
            publicPath("/assets/experiences/creek/creek1.webp"),
            publicPath("/assets/experiences/creek/creek2.webp"),
        ],
    },
    {
        title: "Sunset",
        subtitle: "A premier experience with Swahili snacks and Instagram-worthy sunset photo opportunities.",
        category: "leisure",
        duration: "2h 30m",
        vessel: "",
        location: "Mombasa",
        price: "Ksh 3,000/pax",
        image: publicPath("/assets/experiences/sunset/sunset1.webp"),
        href: "/trips/sunset-sailing",
        featured: false,
        images: [
            publicPath("/assets/experiences/sunset/sunset1.webp"),
            publicPath("/assets/experiences/sunset/sunset2.webp"),
        ],
    },
    {
        title: "Birthdays & Anniversaries",
        subtitle: "Celebrate milestones aboard on the crystal clear waters of the Indian Ocean in Mombasa.",
        category: "family",
        duration: "2 hours",
        vessel: "",
        location: "Mombasa",
        price: "Ksh 2,000/pax",
        image: publicPath("/assets/experiences/events/event1.webp"),
        href: "/trips/birthdays-anniversaries",
        featured: false,
        images: [
            publicPath("/assets/experiences/events/event1.webp"),
            publicPath("/assets/experiences/events/event2.webp"),
        ],
    },
    {
        title: "Snorkelling Reef",
        subtitle: "Float above vibrant coral gardens surrounded by a dazzling array of tropical fish.",
        category: "adventure",
        duration: "2 hours",
        vessel: "",
        location: "Mombasa",
        price: "Ksh 2,000/pax",
        image: publicPath("/assets/experiences/snorkeling/snorkeling.webp"),
        href: "/trips/snorkelling-reef",
        featured: false,
        images: [
            publicPath("/assets/experiences/snorkeling/snorkeling.webp"),
        ],
    },
];

const stats = [
    { value: 5, suffix: "+", label: "Curated Experiences" },
    { value: 8, suffix: "", label: "Hours Max Trip" },
    { value: 35, suffix: "+", label: "Guests Per Vessel" },
    { value: 100, suffix: "%", label: "Safety Certified" },
];

export default function TripsPage() {
    const featured = experiences.find((exp) => exp.featured);
    const regular = experiences.filter((exp) => !exp.featured);

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
                        style={{ backgroundImage: `url('${publicPath("/assets/hero/coastal.jpg")}')` }}
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
                            Boat trips • Mombasa, Kenya
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
                                Curated coastal
                            </motion.span>
                        </span>
                        <span className="block overflow-hidden">
                            <motion.span className="block" variants={{
                                hidden: { opacity: 0, y: 64 },
                                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 26, mass: 1 } },
                            }}>
                                experiences
                            </motion.span>
                        </span>
                        <span className="block overflow-hidden">
                            <motion.span className="block" variants={{
                                hidden: { opacity: 0, y: 64 },
                                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 26, mass: 1 } },
                            }}>
                                on the water
                            </motion.span>
                        </span>
                    </motion.h1>

                    <motion.p variants={{
                        hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
                        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                    }} className="mt-6 max-w-[420px] text-pretty text-sm leading-relaxed text-white/60 sm:text-base">
                        From historic harbour tours to sunset sailings — handpicked boat experiences along the Kenyan coast.
                    </motion.p>

                    <motion.div variants={{
                        hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
                        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                    }} className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
                        <Link href="#experiences" className="group inline-flex items-center gap-2 rounded-full bg-cyan-950 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-cyan-900">
                            View all trips
                            <ArrowUpRight size={16} />
                        </Link>
                        <Link href="/trips/fort-jesus-trip" className="group inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white">
                            Fort Jesus tour
                            <ArrowUpRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
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
                  FEATURED EXPERIENCE: FORT JESUS
            ============================================ */}
            {featured && (
                <section className="py-20 md:py-28 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-white">
                    <div className="max-w-7xl mx-auto">
                        <motion.div className="max-w-2xl" {...fadeUp}>
                            <div className="flex items-center gap-1.5">
                                <span className="size-1.5 bg-zinc-900" />
                                <span className={eyebrowClass + " text-zinc-900"}>Featured Experience</span>
                            </div>
                            <h2 className={`mt-5 ${sectionTitleClass} text-zinc-900`}>
                                {featured.title}
                            </h2>
                            <p className={`mt-3 ${bodyClass}`}>
                                {featured.subtitle}
                            </p>
                        </motion.div>

                        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                            {featured.images.map((src, idx) => (
                                <motion.div
                                    key={src}
                                    className="relative aspect-[4/3] overflow-hidden rounded-xl bg-zinc-100"
                                    initial={{ y: 30, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                                >
                                    <Image
                                        src={src}
                                        alt={`${featured.title} image ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                    />
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            className="mt-8 flex flex-wrap items-center gap-6 text-sm text-zinc-600"
                            {...fadeUp}
                        >
                            <span className="font-medium text-zinc-900">{featured.duration}</span>
                            <span className="w-px h-4 bg-zinc-300" />
                            <span>{featured.location}</span>
                            <span className="w-px h-4 bg-zinc-300" />
                            <span className="font-semibold text-zinc-900">{featured.price}</span>
                            <span className="w-px h-4 bg-zinc-300" />
                            <span className="uppercase tracking-widest text-xs text-zinc-500">{featured.category}</span>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* ============================================
                  ALL EXPERIENCES
            ============================================ */}
            <section id="experiences" className="py-20 md:py-28 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div className="max-w-2xl" {...fadeUp}>
                        <div className="flex items-center gap-1.5">
                            <span className="size-1.5 bg-zinc-900" />
                            <span className={eyebrowClass + " text-zinc-900"}>All Experiences</span>
                        </div>
                        <h2 className={`mt-5 ${sectionTitleClass} text-zinc-900`}>
                            Explore all trips
                        </h2>
                        <p className={`mt-3 ${bodyClass}`}>
                            Browse premium coastal experiences in Mombasa — from Fort Jesus harbour routes to reef snorkelling, mangrove safaris, sunset sailings and private charters.
                        </p>
                    </motion.div>

                    <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {regular.map((exp, index) => (
                            <Link key={exp.href} href={exp.href} className="group relative h-[300px] md:h-[420px] w-full overflow-hidden">
                                <Image
                                    src={exp.image}
                                    alt={exp.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                <motion.div
                                    className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end"
                                    initial={{ y: 20, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.08, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                                >
                                    <span className="inline-block px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-wider text-zinc-700 mb-3 self-start">
                                        {exp.category}
                                    </span>
                                    <h3 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
                                        {exp.title}
                                    </h3>
                                    <p className="text-sm text-white/70 mt-1 max-w-xs">
                                        {exp.subtitle}
                                    </p>
                                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/80">
                                        <span>{exp.duration}</span>
                                        {exp.vessel ? (
                                            <>
                                                <span className="w-px h-3 bg-white/30" />
                                                <span>{exp.vessel}</span>
                                            </>
                                        ) : null}
                                        <span className="w-px h-3 bg-white/30" />
                                        <span>{exp.location}</span>
                                        <span className="w-px h-3 bg-white/30" />
                                        <span className="font-medium text-white">{exp.price}</span>
                                    </div>
                                    <span className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                                        View trip
                                        <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </span>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================
                  WHY BLUE PINEAPPLE
            ============================================ */}
            <section className="py-20 md:py-28 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-zinc-50">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <motion.div className="flex flex-col gap-6" {...fadeUp}>
                        <div className="flex items-center gap-1.5">
                            <span className="size-1.5 bg-zinc-900" />
                            <span className="text-sm text-zinc-900 uppercase tracking-[0.18em]">
                                Why Blue Pineapple
                            </span>
                        </div>
                        <h2 className={`${sectionTitleClass} text-zinc-900 max-w-lg`}>
                            Trusted by guests, proven by the sea
                        </h2>
                        <p className={bodyClass}>
                            Clean boats, clear pricing, experienced crew, and safety-first operations for premium coastal experiences along the Kenyan coast.
                        </p>
                        <div className="flex flex-col gap-4 mt-2">
                            {["Experienced and Dedicated Team", "Honest and Transparent Practices", "Quality Service Delivery", "Customer-Focused Approach"].map((item) => (
                                <div key={item} className="flex items-start gap-3">
                                    <span className="mt-1.5 size-1.5 rounded-full bg-cyan-950 shrink-0" />
                                    <span className="text-sm text-zinc-700">{item}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        className="relative h-[400px] md:h-[520px] w-full rounded-2xl overflow-hidden"
                        initial={{ y: 50, opacity: 0, scale: 0.96 }}
                        whileInView={{ y: 0, opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15, type: "spring", stiffness: 240, damping: 70, mass: 1 }}
                    >
                        <Image
                            src={publicPath("/assets/settingsons/setting01.webp")}
                            alt="Setting Sons luxury cruiser"
                            fill
                            className="object-cover"
                        />
                    </motion.div>
                </div>
            </section>

            {/* ============================================
                  FINAL CTA
            ============================================ */}
            <section className="relative py-36 px-4 md:px-16 lg:px-24 xl:px-32 w-full overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src={publicPath("/assets/experiences/sunset/sunset1.webp")}
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
                        Ready to set sail?
                    </motion.h2>
                    <motion.p
                        className="text-white/70 text-sm md:text-base max-w-[400px] mb-7"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        WhatsApp us to check availability and reserve your spot on any of our coastal experiences.
                    </motion.p>
                    <motion.div
                        className="flex flex-wrap items-center justify-center gap-4"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        <a
                            href="https://wa.me/254708485978?text=Hi%20Blue%20Pineapple%2C%20I'd%20like%20to%20book%20a%20trip"
                            className={primaryButtonClass}
                        >
                            Book on WhatsApp
                            <ArrowUpRight size={16} />
                        </a>
                        <Link href="/trips/fort-jesus-trip" className={invertedButtonClass}>
                            Explore Fort Jesus
                        </Link>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}
