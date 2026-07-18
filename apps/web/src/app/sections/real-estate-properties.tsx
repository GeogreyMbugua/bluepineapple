"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { publicPath } from "@/lib/paths";

const properties = [
    {
        title: "Luxury Apartments",
        category: "Featured Houses for Sale",
        image: publicPath("/assets/galleryImage3.webp"),
        href: "#",
    },
    {
        title: "Prime Plots",
        category: "Plots for Sale",
        image: publicPath("/assets/image1.webp"),
        href: "#",
    },
    {
        title: "Commercial Properties",
        category: "Commercial",
        image: publicPath("/assets/galleryImage2.webp"),
        href: "#",
    },
    {
        title: "Investment Opportunities",
        category: "Investment",
        image: publicPath("/assets/site.webp"),
        href: "#investments",
    },
];

export function RealEstateProperties() {
    return (
        <section id="properties" className="py-16 md:py-25 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-brand-50">
            <div className="max-w-7xl mx-auto">
                <motion.div className="flex items-center gap-1.5"
                    initial={{ y: -20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                    <span className="size-1.5 bg-zinc-900"></span>
                    <span className="text-sm text-zinc-900">
                        PROPERTIES
                    </span>
                </motion.div>
                <motion.h2 className="text-3xl md:text-4xl text-zinc-900 mt-4 leading-tight font-medium max-w-2xl tracking-tight"
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
                >
                    Featured properties and opportunities
                </motion.h2>
                <motion.p className="text-zinc-500 text-sm md:text-base mt-3 max-w-2xl"
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                    Discover premium residential, commercial, and investment properties across Kenya’s coast and beyond — from lifestyle homes to high-growth land opportunities.
                </motion.p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                    {properties.map((prop, index) => (
                        <motion.div
                            key={index}
                            initial={{ y: 40, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                        >
                            <Link href={prop.href} className="group block bg-white rounded-xl overflow-hidden border border-zinc-100 hover:shadow-lg transition-shadow duration-300">
                                <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
                                    <Image src={prop.image} alt={prop.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <div className="absolute top-3 left-3">
                                        <span className="inline-block px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-wider text-zinc-700">
                                            {prop.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-base font-medium text-zinc-900">{prop.title}</h3>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
