"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface PageHeaderProps {
    readonly eyebrow: string;
    readonly title: string;
    readonly description?: string;
    readonly children?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
    return (
        <section className="bg-cyan-950 text-white px-4 md:px-16 lg:px-24 xl:px-32 pt-36 pb-20 w-full">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    className="flex items-center gap-1.5"
                    initial={{ y: -20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                >
                    <span className="size-1.5 bg-white/70" />
                    <span className="text-sm uppercase tracking-[0.18em] text-cyan-100">{eyebrow}</span>
                </motion.div>
                <motion.h1
                    className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mt-5 max-w-3xl"
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
                >
                    {title}
                </motion.h1>
                {description && (
                    <motion.p
                        className="text-cyan-100/70 text-base md:text-lg mt-5 max-w-2xl"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        {description}
                    </motion.p>
                )}
                {children}
            </div>
        </section>
    );
}
