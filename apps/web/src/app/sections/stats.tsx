"use client";

import CountUp from "@/components/marketing/count-number";
import { motion } from "framer-motion";


export function Stats() {
    return (
        <section className="py-16 md:py-25 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-white">
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
                    Building Value, Creating Opportunities
                </motion.h2>

                <motion.p className="text-zinc-500 text-sm md:text-base mt-3 max-w-[520px]"
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                    Blue Pineapple Holdings Ltd is a dynamic Kenyan company committed to providing innovative, reliable, and customer-focused business solutions across real estate, hospitality, tourism, and strategic investments.
                </motion.p>

                <motion.p className="text-zinc-500 text-sm md:text-base mt-3 max-w-[520px]"
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                    We strive to create value through quality service, professionalism, integrity, and sustainable business practices — building long-term relationships that exceed expectations while contributing to economic growth and community development.
                </motion.p>

                <motion.button className="mt-7 bg-zinc-950 hover:bg-zinc-900 text-white px-7 py-3 rounded-full text-sm transition cursor-pointer" 
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                    Discover Our Vision
                </motion.button>
            </div>

            <div className="flex max-lg:flex-col max-lg:gap-10 justify-between max-w-4xl mt-16 md:mt-20">
                <div className="flex flex-col justify-center">
                    <span className="text-4xl md:text-5xl min-w-[152px] text-zinc-900">
                        <CountUp from={0} to={8} />+
                    </span>
                    <span className="text-sm text-zinc-600 mt-4">
                        CORE SERVICE AREAS
                    </span>
                </div>

                <div className="max-lg:hidden h-20 w-px bg-zinc-200"></div>

                <div className="flex flex-col justify-center">
                    <span className="text-4xl md:text-5xl min-w-[200px] text-zinc-900">
                        <CountUp from={0} to={100} />%
                    </span>
                    <span className="text-sm text-zinc-600 mt-4">
                        COMMITMENT TO EXCELLENCE
                    </span>
                </div>

                <div className="max-lg:hidden h-20 w-px bg-zinc-200"></div>

                <div className="flex flex-col justify-center">
                    <span className="text-4xl md:text-5xl min-w-[94px] text-zinc-900">
                        <CountUp from={0} to={6} />+
                    </span>
                    <span className="text-sm text-zinc-600 mt-4">
                        CORE VALUES DRIVING US
                    </span>
                </div>
            </div>
        </section>
    );
}