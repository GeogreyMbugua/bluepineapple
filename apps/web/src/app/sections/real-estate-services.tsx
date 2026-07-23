"use client";

import { motion } from "framer-motion";
import { BriefcaseBusiness, Home, Hotel, Wrench } from "lucide-react";

const services = [
    {
        title: "Real Estate Sales",
        description: "Residential, commercial, and investment properties tailored to buyers and investors.",
        icon: <Home className="size-5 text-brand-950" />,
    },
    {
        title: "Property Management",
        description: "Tenant sourcing, rent collection, maintenance, and day-to-day oversight for strong returns.",
        icon: <BriefcaseBusiness className="size-5 text-brand-950" />,
    },
    {
        title: "Construction & Investments",
        description: "Quality developments and strategic opportunities backed by professional guidance.",
        icon: <Wrench className="size-5 text-brand-950" />,
    },
    {
        title: "Airbnb Management & Hospitality",
        description: "Short-stay management and hospitality-led opportunities designed for premium performance.",
        icon: <Hotel className="size-5 text-brand-950" />,
    },
];

export function RealEstateServices() {
    return (
        <section className="w-full bg-white px-4 py-16 md:px-16 md:py-24 lg:px-24 xl:px-32">
            <div className="mx-auto max-w-7xl">
                <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                    <div className="flex items-center gap-1.5">
                        <span className="size-1.5 bg-zinc-900" />
                        <span className="text-sm uppercase tracking-[0.18em] text-zinc-900">Our Services</span>
                    </div>
                    <h2 className="mt-4 max-w-2xl text-3xl font-medium leading-tight tracking-tight text-zinc-900 md:text-4xl">
                        Comprehensive property solutions from acquisition to management.
                    </h2>
                </motion.div>

                <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {services.map((service, index) => (
                        <motion.article
                            key={service.title}
                            initial={{ y: 40, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.08, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                            className="rounded-2xl border border-zinc-200 bg-brand-50 p-6 shadow-sm"
                        >
                            <div className="inline-flex rounded-full bg-white p-3 shadow-sm">{service.icon}</div>
                            <h3 className="mt-5 text-lg font-semibold text-zinc-900">{service.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-zinc-600">{service.description}</p>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
