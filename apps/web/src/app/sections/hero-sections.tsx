"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { publicPath } from "@/lib/paths";

const fadeBlurUp: Variants = {
    hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
    show: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
};

export function HeroSection() {
    return (
        <section className="relative min-h-screen w-full overflow-hidden bg-black">
            <motion.div
                className="absolute inset-0"
                initial={{ scale: 1.08 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            >
                <div
                    className="absolute inset-0 h-full w-full bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url('${publicPath("/assets/hero2.webp")}')` }}
                />
            </motion.div>

            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <motion.div
                className="container-page relative z-10 flex min-h-screen flex-col justify-center px-6 py-16 sm:px-8 lg:px-12"
                initial="hidden"
                animate="show"
            >
                <motion.div variants={fadeBlurUp} className="mb-8">
                    <Image
                        src={publicPath("/logos/bplogo.png")}
                        alt="Blue Pineapple"
                        width={140}
                        height={140}
                        className="h-12 w-auto sm:h-14"
                    />
                </motion.div>

                <motion.p
                    variants={fadeBlurUp}
                    className="max-w-[12ch] text-4xl font-medium leading-[0.95] tracking-[-0.02em] text-white sm:text-5xl lg:text-6xl"
                >
                    Where the coast meets opportunity.
                </motion.p>

                <motion.div
                    variants={fadeBlurUp}
                    className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4"
                >
                    <a
                        href="/trips"
                        className="inline-flex items-center justify-center rounded-full border border-white/70 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
                    >
                        Coastal Experiences
                    </a>
                    <a
                        href="/real-estate"
                        className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                    >
                        Real Estate
                    </a>
                </motion.div>
            </motion.div>
        </section>
    );
}