"use client";

import CountUp from "@/components/marketing/count-number";
import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { publicPath } from "@/lib/paths";

const sliderImages = [
    { src: publicPath("/assets/image1.webp"), alt: "Blue Pineapple boat charter experience" },
    { src: publicPath("/assets/real.webp"), alt: "Blue Pineapple project on site" },
    { src: publicPath("/assets/galleryImage3.webp"), alt: "Blue Pineapple team at work" },
];

const collageCard =
    "absolute inset-0 rounded-2xl object-cover border-4 border-white shadow-2xl shadow-cyan-950/15";

function StatsCollage() {
    const one = sliderImages[0]!;
    const two = sliderImages[1]!;
    const three = sliderImages[2]!;

    return (
        <div className="group/stats relative w-full h-[380px] sm:h-[440px] lg:h-[480px] select-none">
            {/* back-left */}
            <motion.div
                className="absolute left-0 top-4 z-10 w-[48%] h-[44%] -rotate-6 group-hover/stats:-translate-y-2 group-hover/stats:-rotate-3 transition-all duration-500 ease-out"
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 220, damping: 70, mass: 1 }}
            >
                <Image src={one.src} alt={one.alt} fill className={collageCard} />
            </motion.div>

            {/* back-right */}
            <motion.div
                className="absolute right-0 bottom-4 z-10 w-[48%] h-[44%] rotate-6 group-hover/stats:translate-y-2 group-hover/stats:rotate-3 transition-all duration-500 ease-out"
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, type: "spring", stiffness: 220, damping: 70, mass: 1 }}
            >
                <Image src={three.src} alt={three.alt} fill className={collageCard} />
            </motion.div>

            {/* center hero */}
            <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[70%] h-[64%]"
                initial={{ y: 60, opacity: 0, scale: 0.95 }}
                whileInView={{ y: 0, opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05, type: "spring", stiffness: 220, damping: 70, mass: 1 }}
            >
                <Image
                    src={two.src}
                    alt={two.alt}
                    fill
                    priority
                    className={`${collageCard} group-hover/stats:-translate-y-1 group-hover/stats:scale-[1.02] transition-all duration-500 ease-out`}
                />
            </motion.div>

            {/* floating stat card */}
            <motion.div
                className="absolute top-5 right-5 flex items-center gap-3 bg-white rounded-2xl shadow-lg px-5 py-4 max-w-[220px] z-30"
                initial={{ y: -20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
            >
                <CheckCircle2 className="text-cyan-950 shrink-0" size={28} />
                <div className="flex flex-col">
                    <span className="text-2xl text-zinc-900 leading-none">
                        <CountUp from={0} to={100} />%
                    </span>
                    <span className="text-xs text-zinc-600 mt-1">
                        COMMITMENT TO EXCELLENCE
                    </span>
                </div>
            </motion.div>
        </div>
    );
}

export function Stats() {
    return (
        <section className="py-16 md:py-25 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-cyan-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-10 items-center">

                {/* LEFT: copy + stats */}
                <div className="flex flex-col items-start max-w-3xl">
                    <motion.div className="flex items-center gap-1.5"
                        initial={{ y: -20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        <span className="size-1.5 bg-zinc-900"></span>
                        <span className="text-sm text-zinc-900">
                            BLUE PINEAPPLE HOLDINGS
                        </span>
                    </motion.div>
                    <motion.h2 className="text-5xl md:text-6xl text-zinc-900 mt-8 leading-tight max-w-[610px]"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
                    >
                        Committed to Excellence in Every Project
                    </motion.h2>

                    <motion.p className="text-zinc-500 text-sm md:text-base mt-3 max-w-[520px]"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        We are committed to delivering excellence in every project we undertake — through innovation, ethical business practices, and continuous improvement.
                    </motion.p>

                    <motion.p className="text-zinc-500 text-sm md:text-base mt-3 max-w-[520px]"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.25, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        Our aim is to become the preferred partner for individuals, businesses, and investors seeking reliable opportunities across Kenya and beyond.
                    </motion.p>

                    <motion.button className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-cyan-950 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-cyan-900 cursor-pointer"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        Discover Our Vision
                    </motion.button>

                    <div className="flex max-sm:flex-col max-sm:gap-8 justify-between w-full max-w-lg mt-14">
                        <div className="flex flex-col justify-center">
                            <span className="text-4xl md:text-5xl min-w-[152px] text-zinc-900">
                                <CountUp from={0} to={8} />+
                            </span>
                            <span className="text-sm text-zinc-600 mt-4">
                                CORE SERVICE AREAS
                            </span>
                        </div>

                        <div className="max-sm:hidden h-16 w-px bg-zinc-300"></div>

                        <div className="flex flex-col justify-center">
                            <span className="text-4xl md:text-5xl min-w-[94px] text-zinc-900">
                                <CountUp from={0} to={6} />+
                            </span>
                            <span className="text-sm text-zinc-600 mt-4">
                                CORE VALUES DRIVING US
                            </span>
                        </div>
                    </div>
                </div>

                {/* RIGHT: layered image collage */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15, type: "spring", stiffness: 240, damping: 70, mass: 1 }}
                >
                    <StatsCollage />
                </motion.div>

            </div>
        </section>
    );
}
