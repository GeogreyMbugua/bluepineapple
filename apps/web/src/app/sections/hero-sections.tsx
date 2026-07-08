"use client";

import { ArrowUpRight, ArrowDown } from "lucide-react";
import { motion, type Variants } from "framer-motion";

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
    hidden: { opacity: 0, y: 48 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 220, damping: 74, mass: 1 },
    },
};

const headlineLines = ["Premium", "Experiences.", "Built for Africa."];

const categories = ["Coastal Tourism", "Real Estate", "Strategic Partnerships"];

export function HeroSection() {
    return (
        <section className="relative min-h-screen w-full overflow-hidden bg-black">
            {/* Background layer — breathes: slow intro zoom, then an almost invisible 20s drift */}
            <motion.div
                className="absolute inset-0"
                initial={{ scale: 1.08 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            >
                    <motion.div
                        className="absolute inset-0 h-full w-full bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: "url('./hero.webp')" }}
                        initial={{ scale: 1 }}
                        animate={{ scale: 1.05 }}
                        transition={{ duration: 20, ease: "linear" }}
                    />
            </motion.div>

            {/* Legibility gradients — imagery stays visible on the right, text reads on the left */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

            {/* Content — left-aligned, given room to compose against the imagery */}
            <motion.div
                className="container-page relative z-10 flex min-h-screen flex-col justify-center pt-28 pb-16"
                variants={container}
                initial="hidden"
                animate="show"
            >
               

                <motion.ul
                    variants={fadeBlurUp}
                    className="mb-7 flex flex-wrap gap-x-3 gap-y-2 text-xs font-medium uppercase tracking-[0.18em] text-white/70"
                >
                    {categories.map((item, i) => (
                        <li key={item} className="flex items-center gap-3">
                            {i > 0 && <span className="h-1 w-1 rounded-full bg-white/40" aria-hidden />}
                            {item}
                        </li>
                    ))}
                </motion.ul>

                <motion.h1
                    className="max-w-[14ch] text-5xl font-semibold leading-[1.02] tracking-[-0.03em] text-zinc-50 sm:text-6xl lg:text-7xl"
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
                    className="mt-7 max-w-[520px] text-pretty text-base leading-relaxed text-white/80 sm:text-lg"
                >
                    Blue Pineapple Holdings connects coastal tourism, real estate
                    investment, and strategic partnerships through one enterprise
                    platform.
                </motion.p>

                <motion.div
                    variants={fadeBlurUp}
                    className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
                >
                    <a
                        href="#experiences"
                        className="inline-flex items-center gap-2 rounded-md bg-zinc-50 px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors duration-200 hover:bg-zinc-200"
                    >
                        Explore Experiences
                        <ArrowUpRight size={16} />
                    </a>
                    <a
                        href="#contact"
                        className="group inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
                    >
                        Book a Consultation
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
