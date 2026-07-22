"use client";

import { ArrowUpRight, ArrowDown } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
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

const headlineLines = ["Discover the coast", "with Blue Pineapple"];

export function CoastalHeroSection() {
    return (
        <section className="relative min-h-[100dvh] w-full overflow-hidden bg-black">
            <motion.div
                className="absolute inset-0"
                initial={{ scale: 1.12 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
            >
                <motion.div
                    className="absolute inset-0 h-full w-full bg-cover bg-no-repeat bg-[position:58%_40%] md:bg-center"
                    style={{ backgroundImage: `url('${publicPath("/assets/coastal.webp")}')` }}
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.08 }}
                    transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
                />
            </motion.div>

            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/70 md:bg-gradient-to-r md:from-black/75 md:via-black/35 md:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            <motion.div
                className="container-page relative z-10 flex min-h-[100dvh] flex-col justify-center pt-28 pb-24 md:pb-16"
                variants={container}
                initial="hidden"
                animate="show"
            >
                <motion.div variants={fadeBlurUp} className="mb-6 flex items-center gap-4">
                    <span className="h-px w-8 bg-white/30" aria-hidden />
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/55">
                        Boat trips • Mombasa
                    </span>
                </motion.div>

                <motion.h1
                    className="max-w-[15ch] text-[2rem] font-medium leading-[1.12] tracking-[-0.02em] text-zinc-50 sm:text-5xl lg:text-6xl"
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
                    className="mt-6 max-w-[420px] text-pretty text-sm leading-relaxed text-white/65 sm:text-base"
                >
                    Fort Jesus harbour tours, mangrove creek safaris, snorkelling reefs and sunset sailings — curated for comfort, safety and unforgettable views.
                </motion.p>

                <motion.div
                    variants={fadeBlurUp}
                    className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8"
                >
                    <Link
                        href="#experiences"
                        className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-cyan-950 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-cyan-900"
                    >
                        Explore experiences
                        <ArrowUpRight size={16} />
                    </Link>
                    <Link
                        href="/trips/fort-jesus-trip"
                        className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-medium text-white/95 transition-colors hover:border-white/50 hover:text-white sm:border-0 sm:px-0 sm:py-0"
                    >
                        Fort Jesus
                        <ArrowUpRight
                            size={16}
                            className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                    </Link>
                </motion.div>
            </motion.div>

            <motion.div
                className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/60"
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
