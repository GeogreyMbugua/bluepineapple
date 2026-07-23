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
                    className="absolute inset-0 h-full w-full bg-cover bg-no-repeat bg-center md:bg-[position:58%_40%]"
                    style={{ backgroundImage: `url('${publicPath("/assets/hero/coastal.jpg")}')` }}
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.08 }}
                    transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
                />
            </motion.div>

            {/* Overlay scoped to where the copy sits — top of the photo stays clean */}
            <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 via-40% to-transparent to-75% md:from-black/70 md:via-black/25 md:via-45%"
                aria-hidden
            />

            <motion.div
                className="container-page relative z-10 flex min-h-[100dvh] flex-col justify-end gap-12 pb-24 pt-32 md:justify-center md:gap-16 md:pb-16"
                variants={container}
                initial="hidden"
                animate="show"
            >
                {/* Eyebrow */}
                <motion.div variants={fadeBlurUp} className="flex items-center gap-4">
                    <span className="h-px w-8 bg-white/40" aria-hidden />
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                        Boat trips • Mombasa
                    </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    className="max-w-[18ch] text-[2.25rem] font-medium leading-[1.2] tracking-[-0.02em] text-white sm:text-6xl md:text-7xl lg:text-[5.5rem] lg:leading-[1.1]"
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

                {/* Body copy + CTAs share the horizontal space now that we're not squeezed into a narrow card */}
                <motion.div
                    variants={fadeBlurUp}
                    className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-16"
                >
                    <p className="max-w-[440px] text-pretty text-sm leading-relaxed text-white/85 sm:text-base">
                        Fort Jesus harbour tours, mangrove creek safaris, snorkelling reefs and sunset sailings — curated for comfort, safety and unforgettable views.
                    </p>

                    <div className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                        <Link
                            href="#experiences"
                            className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-cyan-950 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-cyan-900"
                        >
                            Explore experiences
                            <ArrowUpRight size={16} />
                        </Link>
                        <Link
                            href="/trips/fort-jesus-trip"
                            className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
                        >
                            Fort Jesus
                            <ArrowUpRight
                                size={16}
                                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            />
                        </Link>
                    </div>
                </motion.div>
            </motion.div>

            <motion.div
                className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/80 [text-shadow:0_1px_10px_rgba(0,0,0,0.3)]"
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