"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { publicPath } from "@/lib/paths";

const opportunities = [
    {
        title: "Land Banking",
        description: "Secure strategic plots in high-growth coastal and inland corridors with strong long-term appreciation potential.",
        image: publicPath("/assets/site.webp"),
    },
    {
        title: "Vacation Rentals",
        description: "High-performing short-stay opportunities in premium holiday destinations designed for strong Airbnb returns.",
        image: publicPath("/assets/galleryImage3.webp"),
    },
    {
        title: "Residential Developments",
        description: "Modern homes and lifestyle-focused developments built to meet the needs of discerning buyers and investors.",
        image: publicPath("/assets/galleryImage2.webp"),
    },
    {
        title: "Commercial Properties",
        description: "Prime retail, office, and mixed-use opportunities positioned for growth in active market areas.",
        image: publicPath("/assets/location.webp"),
    },
];

export function RealEstateInvestments() {
    return (
        <section id="investments" className="w-full bg-brand-50 px-4 py-16 md:px-16 md:py-24 lg:px-24 xl:px-32">
            <div className="mx-auto max-w-7xl grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
                <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    className="max-w-2xl"
                >
                    <div className="flex items-center gap-1.5">
                        <span className="size-1.5 bg-zinc-900" />
                        <span className="text-sm text-zinc-900 uppercase tracking-[0.18em]">Investment Opportunities</span>
                    </div>
                    <h2 className="mt-4 text-3xl font-medium leading-tight tracking-tight text-zinc-900 md:text-4xl">
                        Invest in Kenya&apos;s coast with confidence.
                    </h2>
                    <p className="mt-4 text-sm leading-relaxed text-zinc-600 md:text-base">
                        From land banking to hospitality-led developments, we curate opportunities designed for long-term growth, lifestyle value, and dependable returns.
                    </p>

                    <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">Client Note</p>
                        <p className="mt-3 text-xl font-medium leading-snug text-zinc-900">
                            “Where lifestyle meets investment opportunity.”
                        </p>
                    </div>
                </motion.div>

                <div className="grid gap-6 md:grid-cols-2">
                    {opportunities.map((item, index) => (
                        <motion.article
                            key={item.title}
                            initial={{ y: 40, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.08, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
                        >
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <Image src={item.image} alt={item.title} fill className="object-cover" />
                            </div>
                            <div className="p-5">
                                <h3 className="text-lg font-semibold text-zinc-900">{item.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.description}</p>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
