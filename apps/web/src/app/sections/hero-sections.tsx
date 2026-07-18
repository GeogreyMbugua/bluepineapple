"use client";

import { ArrowUpRight, ArrowDown } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { publicPath } from "@/lib/paths";

const container: Variants = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.14, delayChildren: 0.35 },
    },
};

const fadeBlurUp: Variants = {
    hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
    show: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
};

const lineUp: Variants = {
    hidden: { opacity: 0, y: 64 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 200, damping: 26, mass: 1 },
    },
};

const headlineLines = ["Building Value,", "Creating Opportunities."];

const categories = ["Real Estate", "Property Management", "Construction & Investments", "Hospitality & Tourism"];

export function HeroSection() {
    return (
        <section className="relative min-h-screen w-full overflow-hidden bg-black">
            {/* Background layer — real punch-in on load, then a genuine slow 20s drift outward */}
            <motion.div
                className="absolute inset-0"
                initial={{ scale: 1.12 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
            >
                <motion.div
                    className="absolute inset-0 h-full w-full bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url('${publicPath("/assets/hero2.webp")}')` }}
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.08 }}
                    transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
                />
            </motion.div>

            {/* Legibility gradients — imagery stays visible on the right, text reads on the left */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* Content — left-aligned, given real room to compose against the imagery */}
            <motion.div
                className="container-page relative z-10 flex min-h-screen flex-col justify-center pt-28 pb-16"
                variants={container}
                initial="hidden"
                animate="show"
            >
                <motion.div variants={fadeBlurUp} className="mb-6 flex items-center gap-4">
                    <span className="h-px w-8 bg-white/30" aria-hidden />
                    <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">
                        {categories.map((item, i) => (
                            <li key={item} className="flex items-center gap-4">
                                {i > 0 && <span className="text-white/25">/</span>}
                                {item}
                            </li>
                        ))}
                    </ul>
                </motion.div>

                <motion.h1
                    className="max-w-[15ch] text-4xl font-medium leading-[1.08] tracking-[-0.02em] text-zinc-50 sm:text-5xl lg:text-6xl"
                    variants={container}
                >
                    {headlineLines.map((line) => (
                        <span key={line} className="block overflow-hidden">
                            <motion.span variants={lineUp} className="block">
                                {line}
                            </motion.span>
                        </span>
                    ))}
                </motion.h1>

                <motion.p
                    variants={fadeBlurUp}
                    className="mt-6 max-w-[420px] text-pretty text-sm leading-relaxed text-white/60 sm:text-base"
                >
                    A Kenyan holding company across real estate, property management, construction, and hospitality.
                </motion.p>

                <motion.div
                    variants={fadeBlurUp}
                    className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4"
                >
                    <a
                        href="#services"
                        className="group inline-flex items-center gap-2 rounded-full bg-cyan-950 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-cyan-900"
                    >
                        Our Services
                        <ArrowUpRight size={16} />
                    </a>
                    <a
                        href="#contact"
                        className="group inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
                    >
                        Contact Us
                        <ArrowUpRight
                            size={16}
                            className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                    </a>
                </motion.div>
            </motion.div>

            {/* Scroll cue */}
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
    );
}