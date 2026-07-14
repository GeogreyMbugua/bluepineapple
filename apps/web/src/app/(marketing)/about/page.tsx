"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { ShieldCheck, BadgeCheck, Star, Lightbulb, Heart, Scale, Users, Leaf, ArrowUpRight, ArrowDown } from "lucide-react";
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { primaryButtonClass } from '@/components/marketing/button';
import { eyebrowClass, sectionTitleClass, bodyClass, cardTitleClass, smallClass } from '@/components/marketing/typography';
import CountUp from "@/components/marketing/count-number";
import { publicPath } from "@/lib/paths";

const fadeUp = {
    initial: { y: 40, opacity: 0 },
    whileInView: { y: 0, opacity: 1 },
    viewport: { once: true },
    transition: { type: "spring", stiffness: 320, damping: 70, mass: 1 },
} as const;

const principles = [
    {
        icon: <ShieldCheck className="size-5 text-cyan-950" />,
        title: "Integrity",
        description: "Honest relationships and transparent decisions in everything we do.",
    },
    {
        icon: <BadgeCheck className="size-5 text-cyan-950" />,
        title: "Professionalism",
        description: "Skilled, disciplined delivery that reflects the standards our clients expect.",
    },
    {
        icon: <Star className="size-5 text-cyan-950" />,
        title: "Excellence",
        description: "We pursue the highest quality in every product, service, and project.",
    },
    {
        icon: <Lightbulb className="size-5 text-cyan-950" />,
        title: "Innovation",
        description: "Modern, forward-thinking solutions across real estate, hospitality, and investment.",
    },
    {
        icon: <Heart className="size-5 text-cyan-950" />,
        title: "Customer Satisfaction",
        description: "We put clients and partners first, measuring success by their outcomes.",
    },
    {
        icon: <Scale className="size-5 text-cyan-950" />,
        title: "Accountability",
        description: "We take ownership and follow through with transparency and responsibility.",
    },
    {
        icon: <Users className="size-5 text-cyan-950" />,
        title: "Teamwork",
        description: "Collaboration across our teams and partners drives lasting results.",
    },
    {
        icon: <Leaf className="size-5 text-cyan-950" />,
        title: "Sustainability",
        description: "Responsible, ethical practices that contribute to community and economic growth.",
    },
];

const businesses = [
    {
        title: "Coastal Experiences",
        subtitle: "Boat Tours • Snorkeling • Fort Jesus • Sunset Cruises",
        href: "/coastal-experiences",
        image: publicPath("/assets/set.webp"),
    },
    {
        title: "Hospitality",
        subtitle: "Premium accommodations and dining along the Kenyan coast",
        href: "#",
        image: publicPath("/assets/about.webp"),
    },
    {
        title: "Real Estate",
        subtitle: "Investment properties and development opportunities",
        href: "#",
        image: publicPath("/assets/real.webp"),
    },
    {
        title: "Investments",
        subtitle: "Sustainable investment opportunities across East Africa",
        href: "#",
        image: publicPath("/assets/site.webp"),
    },
];

const stats = [
    { value: 15, suffix: "+", label: "Years Experience" },
    { value: 4, suffix: "", label: "Business Divisions" },
    { value: 1000, suffix: "+", label: "Happy Guests" },
    { value: 100, suffix: "%", label: "Customer Focus" },
];

export default function AboutPage() {
    return (
        <MarketingShell variant="parent">
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
                        style={{ backgroundImage: `url('${publicPath("/assets/about.webp")}')` }}
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
                            About Blue Pineapple
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
                                Blue Pineapple Holdings
                            </motion.span>
                        </span>
                        <span className="block overflow-hidden">
                            <motion.span className="block" variants={{
                                hidden: { opacity: 0, y: 64 },
                                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 26, mass: 1 } },
                            }}>
                                Creating Exceptional Coastal
                            </motion.span>
                        </span>
                        <span className="block overflow-hidden">
                            <motion.span className="block" variants={{
                                hidden: { opacity: 0, y: 64 },
                                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 26, mass: 1 } },
                            }}>
                                Experiences &amp; Sustainable Investments
                            </motion.span>
                        </span>
                    </motion.h1>

                    <motion.p variants={{
                        hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
                        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                    }} className="mt-6 max-w-[420px] text-pretty text-sm leading-relaxed text-white/60 sm:text-base">
                        We combine tourism, hospitality, coastal services and investment expertise to create experiences people remember.
                    </motion.p>

                    <motion.div variants={{
                        hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
                        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                    }} className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
                        <Link href="#story" className="group inline-flex items-center gap-2 rounded-full bg-cyan-950 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-cyan-900">
                            Explore Our Story
                            <ArrowUpRight size={16} />
                        </Link>
                        <Link href="/coastal-experiences" className="group inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white">
                            Our Experiences
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
                  COMPANY STORY
            ============================================ */}
            <section id="story" className="py-20 md:py-28 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-white">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <motion.div className="flex flex-col gap-6" {...fadeUp}>
                        <div className="flex items-center gap-1.5">
                            <span className="size-1.5 bg-zinc-900" />
                            <span className="text-sm text-zinc-900 uppercase tracking-[0.18em]">
                                Our Story
                            </span>
                        </div>
                        <h2 className={`${sectionTitleClass} text-zinc-900 max-w-lg`}>
                            Built on vision, driven by experience
                        </h2>
                        <p className={bodyClass}>
                            Blue Pineapple Holdings was founded with a vision of creating businesses that combine innovation, professionalism, and unforgettable customer experiences.
                        </p>
                        <p className={bodyClass}>
                            Today our portfolio spans coastal tourism, boat experiences, real estate, hospitality, and investment opportunities — all rooted in the Kenyan coastal identity.
                        </p>
                        <div className="flex flex-col gap-3 mt-2">
                            {["Coastal Tourism", "Boat Experiences", "Real Estate", "Hospitality", "Investment Opportunities"].map((item) => (
                                <div key={item} className="flex items-center gap-3">
                                    <span className="size-1.5 rounded-full bg-cyan-950" />
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
                            src={publicPath("/assets/crew.webp")}
                            alt="Blue Pineapple team and crew"
                            fill
                            priority
                            className="object-cover"
                        />
                    </motion.div>
                </div>
            </section>

            {/* ============================================
                  BUSINESS PORTFOLIO — FULL BLEED IMAGES
            ============================================ */}
            <section className="py-20 md:py-28 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-white">
                <div className="max-w-7xl mx-auto mb-14">
                    <motion.div className="max-w-2xl" {...fadeUp}>
                        <div className="flex items-center gap-1.5">
                            <span className="size-1.5 bg-zinc-900" />
                            <span className={eyebrowClass + " text-zinc-900"}>Our Businesses</span>
                        </div>
                        <h2 className={`mt-5 ${sectionTitleClass} text-zinc-900`}>
                            A diversified portfolio built for lasting impact
                        </h2>
                    </motion.div>
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {businesses.map((business, index) => (
                        <Link key={business.title} href={business.href} className="group relative h-[300px] md:h-[420px] w-full overflow-hidden">
                            <Image
                                src={business.image}
                                alt={business.title}
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
                                <h3 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
                                    {business.title}
                                </h3>
                                <p className="text-sm text-white/70 mt-1 max-w-xs">
                                    {business.subtitle}
                                </p>
                                <span className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                                    Learn more
                                    <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </span>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ============================================
                  VISION & MISSION
            ============================================ */}
            <section className="py-20 md:py-28 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div className="text-center mb-14" {...fadeUp}>
                        <div className="flex items-center justify-center gap-1.5">
                            <span className="size-1.5 bg-zinc-900" />
                            <span className="text-sm text-zinc-900 uppercase tracking-[0.18em]">
                                Our Purpose
                            </span>
                            <span className="size-1.5 bg-zinc-900" />
                        </div>
                        <h2 className={`mt-5 ${sectionTitleClass} text-zinc-900`}>
                            Vision & Mission
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
                        <motion.div className="flex flex-col items-start gap-5" {...fadeUp}>
                            <div className="size-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center">
                                <Star className="size-6 text-cyan-950" />
                            </div>
                            <span className={eyebrowClass + " text-cyan-950"}>Vision</span>
                            <h3 className="text-xl md:text-2xl font-semibold text-zinc-900 tracking-tight">
                                A trusted holdings leader in Kenya and across Africa
                            </h3>
                            <p className={bodyClass}>
                                To become a leading and trusted holdings company in Kenya and across Africa by delivering innovative, sustainable, and high-quality business solutions.
                            </p>
                        </motion.div>

                        <motion.div className="flex flex-col items-start gap-5" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
                            <div className="size-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center">
                                <BadgeCheck className="size-6 text-cyan-950" />
                            </div>
                            <span className={eyebrowClass + " text-cyan-950"}>Mission</span>
                            <h3 className="text-xl md:text-2xl font-semibold text-zinc-900 tracking-tight">
                                Exceptional service, lasting value
                            </h3>
                            <p className={bodyClass}>
                                To provide exceptional products and services through professionalism, innovation, integrity, and customer satisfaction while creating lasting value for our clients, partners, employees, and communities.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ============================================
                  IMAGE + TEXT SECTION
            ============================================ */}
            <section className="py-20 md:py-28 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-zinc-50">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <motion.div
                        className="relative h-[400px] md:h-[520px] w-full rounded-2xl overflow-hidden lg:order-2"
                        initial={{ y: 50, opacity: 0, scale: 0.96 }}
                        whileInView={{ y: 0, opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15, type: "spring", stiffness: 240, damping: 70, mass: 1 }}
                    >
                        <Image
                            src={publicPath("/assets/snorkling.webp")}
                            alt="Premium coastal experience"
                            fill
                            className="object-cover"
                        />
                    </motion.div>

                    <motion.div className="flex flex-col gap-6 lg:order-1" {...fadeUp}>
                        <div className="flex items-center gap-1.5">
                            <span className="size-1.5 bg-zinc-900" />
                            <span className="text-sm text-zinc-900 uppercase tracking-[0.18em]">
                                Premium Experiences
                            </span>
                        </div>
                        <h2 className={`${sectionTitleClass} text-zinc-900 max-w-lg`}>
                            Built around people, powered by the coast
                        </h2>
                        <p className={bodyClass}>
                            From sunset cruises to snorkeling adventures, every experience is curated with attention to detail, safety, and authentic Kenyan hospitality.
                        </p>
                        <p className={bodyClass}>
                            Our team of experienced captains and crew ensure every moment on the water feels premium, personal, and unforgettable.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ============================================
                  CORE VALUES
            ============================================ */}
            <section className="py-20 md:py-28 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div className="max-w-2xl" {...fadeUp}>
                        <div className="flex items-center gap-1.5">
                            <span className="size-1.5 bg-zinc-900" />
                            <span className={eyebrowClass + " text-zinc-900"}>Core Values</span>
                        </div>
                        <h2 className={`mt-5 ${sectionTitleClass} text-zinc-900`}>
                            What guides everything we do
                        </h2>
                    </motion.div>

                    <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
                        {principles.map((value, index) => (
                            <motion.div
                                key={value.title}
                                className="flex flex-col gap-3"
                                initial={{ y: 40, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                            >
                                <div className="size-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center">
                                    {value.icon}
                                </div>
                                <h3 className={cardTitleClass + " text-zinc-900"}>{value.title}</h3>
                                <p className={smallClass}>{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================
                  WHY BLUE PINEAPPLE
            ============================================ */}
            <section className="py-20 md:py-28 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-white">
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
                            src={publicPath("/assets/24setting.webp")}
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
                        Ready to Experience Blue Pineapple?
                    </motion.h2>
                    <motion.p
                        className="text-white/70 text-sm md:text-base max-w-[400px] mb-7"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        Explore our coastal experiences or reach out and start the conversation.
                    </motion.p>
                    <motion.div
                        className="flex flex-wrap items-center justify-center gap-4"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        <Link href="/coastal-experiences" className={primaryButtonClass}>
                            Explore Experiences
                            <ArrowUpRight size={16} />
                        </Link>
                        <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/10">
                            Contact Us
                        </Link>
                    </motion.div>
                </div>
            </section>
        </MarketingShell>
    );
}