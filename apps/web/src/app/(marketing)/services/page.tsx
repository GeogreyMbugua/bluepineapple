"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight, ArrowDown, Building2, KeyRound, MapPin, HardHat, TrendingUp, Package, Briefcase, Hotel } from "lucide-react";
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { primaryButtonClass } from '@/components/marketing/button';
import { sectionTitleClass, bodyClass } from '@/components/marketing/typography';
import CountUp from "@/components/marketing/count-number";
import { publicPath } from "@/lib/paths";

const fadeUp = {
    initial: { y: 40, opacity: 0 },
    whileInView: { y: 0, opacity: 1 },
    viewport: { once: true },
    transition: { type: "spring", stiffness: 320, damping: 70, mass: 1 },
} as const;

const services = [
    {
        icon: <Building2 className="size-5 text-cyan-950" />,
        title: "Real Estate Investment and Property Marketing",
        description: "End-to-end marketing and investment support that positions properties for the right partners and buyers.",
    },
    {
        icon: <KeyRound className="size-5 text-cyan-950" />,
        title: "Property Management",
        description: "Reliable, hands-on management that protects asset value and keeps occupants confident.",
    },
    {
        icon: <MapPin className="size-5 text-cyan-950" />,
        title: "Land Sales and Development",
        description: "Sourcing, sales, and structured development of land for long-term value creation.",
    },
    {
        icon: <HardHat className="size-5 text-cyan-950" />,
        title: "Construction and Project Management",
        description: "From planning to handover, we deliver projects on time with disciplined execution.",
    },
    {
        icon: <TrendingUp className="size-5 text-cyan-950" />,
        title: "Investment Consultancy",
        description: "Clear, data-informed guidance to help you make confident, sustainable investment decisions.",
    },
    {
        icon: <Package className="size-5 text-cyan-950" />,
        title: "General Supplies",
        description: "Dependable supply solutions that keep operations running smoothly and on schedule.",
    },
    {
        icon: <Briefcase className="size-5 text-cyan-950" />,
        title: "Business Consultancy",
        description: "Practical strategy and operational support tailored to growing, ambitious businesses.",
    },
    {
        icon: <Hotel className="size-5 text-cyan-950" />,
        title: "Hospitality and Tourism Investments",
        description: "Opportunities across Kenya's coastal and tourism economy, built for premium experiences.",
    },
];

const stats = [
    { value: 8, suffix: "+", label: "Service Areas" },
    { value: 15, suffix: "+", label: "Years Experience" },
    { value: 100, suffix: "%", label: "Client Retention" },
    { value: 50, suffix: "+", label: "Projects Delivered" },
];

export default function ServicesPage() {
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
                        style={{ backgroundImage: `url('${publicPath("/assets/hero1.webp")}')` }}
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
                            Our Services
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
                                Comprehensive Business
                            </motion.span>
                        </span>
                        <span className="block overflow-hidden">
                            <motion.span className="block" variants={{
                                hidden: { opacity: 0, y: 64 },
                                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 26, mass: 1 } },
                            }}>
                                Solutions for Lasting
                            </motion.span>
                        </span>
                        <span className="block overflow-hidden">
                            <motion.span className="block" variants={{
                                hidden: { opacity: 0, y: 64 },
                                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 26, mass: 1 } },
                            }}>
                                Impact
                            </motion.span>
                        </span>
                    </motion.h1>

                    <motion.p variants={{
                        hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
                        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                    }} className="mt-6 max-w-[420px] text-pretty text-sm leading-relaxed text-white/60 sm:text-base">
                        From real estate to hospitality, construction to investment — we deliver excellence at every stage.
                    </motion.p>

                    <motion.div variants={{
                        hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
                        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                    }} className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
                        <Link href="#services-list" className="group inline-flex items-center gap-2 rounded-full bg-cyan-950 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-cyan-900">
                            Explore Services
                            <ArrowUpRight size={16} />
                        </Link>
                        <Link href="/contact" className="group inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white">
                            Get in Touch
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
                  SERVICES LIST — CLEAN, NO CARDS
            ============================================ */}
            <section id="services-list" className="py-20 md:py-28 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div className="max-w-2xl mb-16" {...fadeUp}>
                        <div className="flex items-center gap-1.5">
                            <span className="size-1.5 bg-zinc-900" />
                            <span className="text-sm text-zinc-900 uppercase tracking-[0.18em]">
                                What We Do
                            </span>
                        </div>
                        <h2 className={`mt-5 ${sectionTitleClass} text-zinc-900`}>
                            End-to-end solutions across every sector
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        {services.map((service, index) => (
                            <motion.div
                                key={service.title}
                                className="flex flex-col gap-3 py-6 border-b border-zinc-100 last:border-0"
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center">
                                        {service.icon}
                                    </div>
                                    <h3 className="text-lg font-semibold text-zinc-900 tracking-tight">
                                        {service.title}
                                    </h3>
                                </div>
                                <p className="text-sm text-zinc-500 leading-relaxed max-w-xl">
                                    {service.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================
                  IMAGE + TEXT SECTION
            ============================================ */}
            <section className="py-20 md:py-28 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-zinc-50">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <motion.div className="flex flex-col gap-6" {...fadeUp}>
                        <div className="flex items-center gap-1.5">
                            <span className="size-1.5 bg-zinc-900" />
                            <span className="text-sm text-zinc-900 uppercase tracking-[0.18em]">
                                Our Approach
                            </span>
                        </div>
                        <h2 className={`${sectionTitleClass} text-zinc-900 max-w-lg`}>
                            Built on expertise, driven by results
                        </h2>
                        <p className={bodyClass}>
                            We bring together deep sector knowledge, disciplined project management, and a client-first mindset to deliver solutions that create real, measurable value.
                        </p>
                        <p className={bodyClass}>
                            Whether you are developing land, managing property, or investing for the future — our team is with you at every stage.
                        </p>
                    </motion.div>

                    <motion.div
                        className="relative h-[400px] md:h-[520px] w-full rounded-2xl overflow-hidden"
                        initial={{ y: 50, opacity: 0, scale: 0.96 }}
                        whileInView={{ y: 0, opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15, type: "spring", stiffness: 240, damping: 70, mass: 1 }}
                    >
                        <Image
                            src={publicPath("/assets/real.webp")}
                            alt="Blue Pineapple real estate development"
                            fill
                            className="object-cover"
                        />
                    </motion.div>
                </div>
            </section>

            {/* ============================================
                  WHY CHOOSE US
            ============================================ */}
            <section className="py-20 md:py-28 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-white">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <motion.div
                        className="relative h-[400px] md:h-[520px] w-full rounded-2xl overflow-hidden lg:order-2"
                        initial={{ y: 50, opacity: 0, scale: 0.96 }}
                        whileInView={{ y: 0, opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15, type: "spring", stiffness: 240, damping: 70, mass: 1 }}
                    >
                        <Image
                            src={publicPath("/assets/site.webp")}
                            alt="Construction and development project"
                            fill
                            className="object-cover"
                        />
                    </motion.div>

                    <motion.div className="flex flex-col gap-6 lg:order-1" {...fadeUp}>
                        <div className="flex items-center gap-1.5">
                            <span className="size-1.5 bg-zinc-900" />
                            <span className="text-sm text-zinc-900 uppercase tracking-[0.18em]">
                                Why Blue Pineapple
                            </span>
                        </div>
                        <h2 className={`${sectionTitleClass} text-zinc-900 max-w-lg`}>
                            A partner you can rely on
                        </h2>
                        <p className={bodyClass}>
                            We combine deep local knowledge with global best practices to deliver projects on time, on budget, and to the highest standards.
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
                        Ready to build something with us?
                    </motion.h2>
                    <motion.p
                        className="text-white/70 text-sm md:text-base max-w-[400px] mb-7"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        Tell us about your plans and we will connect you with the right team.
                    </motion.p>
                    <motion.div
                        className="flex flex-wrap items-center justify-center gap-4"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        <Link href="/contact" className={primaryButtonClass}>
                            Get in Touch
                            <ArrowUpRight size={16} />
                        </Link>
                        <Link href="/about" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/10">
                            About Us
                        </Link>
                    </motion.div>
                </div>
            </section>
        </MarketingShell>
    );
}