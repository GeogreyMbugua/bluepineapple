"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight, ArrowDown, Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { primaryButtonClass, invertedButtonClass } from "@/components/marketing/button";
import { eyebrowClass, sectionTitleClass, bodyClass } from "@/components/marketing/typography";
import { publicPath } from "@/lib/paths";

const MAP_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127641.23956217018!2d39.6505534!3d-4.0434778!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x18401be4e389d071%3A0xef2e44a5161c9c1a!2sMombasa%2C%20Kenya!5e0!3m2!1sen!2sus!4v1719999999999";

const fadeUp = {
    initial: { y: 40, opacity: 0 },
    whileInView: { y: 0, opacity: 1 },
    viewport: { once: true },
    transition: { type: "spring", stiffness: 320, damping: 70, mass: 1 },
} as const;

const contactMethods = [
    {
        icon: <Phone className="size-5 text-cyan-950" />,
        title: "Phone",
        detail: "+254 708 485 978",
        href: "tel:+254708485978",
    },
    {
        icon: <Mail className="size-5 text-cyan-950" />,
        title: "Email",
        detail: "bluepineappleholdings@gmail.com",
        href: "mailto:bluepineappleholdings@gmail.com",
    },
    {
        icon: <MapPin className="size-5 text-cyan-950" />,
        title: "Location",
        detail: "Mombasa Marina, Mombasa, Kenya",
        href: "https://maps.google.com",
    },
    {
        icon: <Clock className="size-5 text-cyan-950" />,
        title: "Office Hours",
        detail: "Mon - Sun: 8:00 AM - 6:00 PM",
        href: null,
    },
];

export default function ContactPage() {
    return (
        <MarketingShell variant="parent">
        <main className="bg-background text-foreground">
            {/* ============================================
                  FULL SCREEN HERO
            ============================================ */}
            <section className="relative min-h-[70vh] w-full overflow-hidden bg-black">
                <motion.div
                    className="absolute inset-0"
                    initial={{ scale: 1.12 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    <motion.div
                        className="absolute inset-0 h-full w-full bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url('${publicPath("/assets/set.webp")}')` }}
                        initial={{ scale: 1 }}
                        animate={{ scale: 1.08 }}
                        transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
                    />
                </motion.div>

                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                <motion.div
                    className="container-page relative z-10 flex min-h-[70vh] flex-col justify-center pt-28 pb-16"
                    initial="hidden"
                    animate="show"
                    variants={{
                        hidden: {},
                        show: { transition: { staggerChildren: 0.14, delayChildren: 0.35 } },
                    }}
                >
                    <motion.div variants={{
                        hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
                        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                    }} className="mb-6 flex items-center gap-4">
                        <span className="h-px w-8 bg-white/30" aria-hidden />
                        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">
                            Contact Blue Pineapple
                        </span>
                    </motion.div>

                    <motion.h1
                        className="max-w-[15ch] text-4xl font-medium leading-[1.08] tracking-[-0.02em] text-zinc-50 sm:text-5xl lg:text-6xl"
                        variants={{
                            hidden: {},
                            show: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } },
                        }}
                    >
                        <span className="block overflow-hidden">
                            <motion.span className="block" variants={{
                                hidden: { opacity: 0, y: 64 },
                                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 26, mass: 1 } },
                            }}>
                                We&apos;d love to
                            </motion.span>
                        </span>
                        <span className="block overflow-hidden">
                            <motion.span className="block" variants={{
                                hidden: { opacity: 0, y: 64 },
                                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 26, mass: 1 } },
                            }}>
                                hear from you
                            </motion.span>
                        </span>
                    </motion.h1>

                    <motion.p variants={{
                        hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
                        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                    }} className="mt-6 max-w-[520px] text-pretty text-sm leading-relaxed text-white/60 sm:text-base">
                        Whether you&apos;re planning an unforgettable coastal experience or exploring partnership opportunities, we&apos;re here to help.
                    </motion.p>

                    <motion.div variants={{
                        hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
                        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                    }} className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
                        <a
                            href="https://wa.me/254708485978?text=Hi%20Blue%20Pineapple%2C%20I'd%20like%20to%20get%20in%20touch"
                            className="group inline-flex items-center gap-2 rounded-full bg-cyan-950 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-cyan-900"
                        >
                            Chat on WhatsApp
                            <MessageCircle size={16} />
                        </a>
                        <Link href="#contact-methods" className="group inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white">
                            Contact details
                            <ArrowUpRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                    </motion.div>
                </motion.div>

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

            {/* ============================================
                  CONTACT METHODS + MAP
            ============================================ */}
            <section id="contact-methods" className="py-20 md:py-28 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div className="max-w-2xl" {...fadeUp}>
                        <div className="flex items-center gap-1.5">
                            <span className="size-1.5 bg-zinc-900" />
                            <span className={eyebrowClass + " text-zinc-900"}>Get in Touch</span>
                        </div>
                        <h2 className={`mt-5 ${sectionTitleClass} text-zinc-900`}>
                            Contact details
                        </h2>
                        <p className={`mt-3 ${bodyClass}`}>
                            Reach out directly or visit us at the marina. We respond within a few hours.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                        {contactMethods.map((method, i) => (
                            <motion.div
                                key={method.title}
                                className="flex flex-col gap-4 bg-zinc-50 rounded-xl p-6 border border-zinc-100"
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                            >
                                <div className="size-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center">
                                    {method.icon}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-zinc-500 uppercase tracking-wider">{method.title}</span>
                                    {method.href ? (
                                        <Link href={method.href} className="text-sm font-medium text-zinc-900 hover:text-cyan-950 transition-colors">
                                            {method.detail}
                                        </Link>
                                    ) : (
                                        <span className="text-sm font-medium text-zinc-900">{method.detail}</span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Map */}
                    <motion.div
                        className="relative h-[400px] md:h-[520px] w-full rounded-2xl overflow-hidden mt-12"
                        initial={{ y: 50, opacity: 0, scale: 0.96 }}
                        whileInView={{ y: 0, opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15, type: "spring", stiffness: 240, damping: 70, mass: 1 }}
                    >
                        <iframe
                            src={MAP_URL}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="absolute inset-0 w-full h-full"
                        />
                    </motion.div>
                </div>
            </section>

            {/* ============================================
                  MESSAGE FORM
            ============================================ */}
            <section className="py-20 md:py-28 px-4 md:px-16 lg:px-24 xl:px-32 w-full bg-zinc-50">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <motion.div className="flex flex-col gap-6" {...fadeUp}>
                        <div className="flex items-center gap-1.5">
                            <span className="size-1.5 bg-zinc-900" />
                            <span className="text-sm text-zinc-900 uppercase tracking-[0.18em]">
                                Send a Message
                            </span>
                        </div>
                        <h2 className={`${sectionTitleClass} text-zinc-900 max-w-lg`}>
                            Let&apos;s start the conversation
                        </h2>
                        <p className={bodyClass}>
                            Have questions about our trips? We would love to hear from you. Chat on WhatsApp or fill out the form below.
                        </p>

                        <form className="mt-2 flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex flex-col">
                                    <motion.label htmlFor="name" className="text-sm text-zinc-600 mb-2" variants={fadeUp} viewport={{ once: true }}>
                                        YOUR NAME
                                    </motion.label>
                                    <motion.input id="name" type="text" placeholder="A. Patel" className="w-full border border-zinc-200 rounded-sm px-4 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-300 transition-colors" variants={fadeUp} viewport={{ once: true }} />
                                </div>
                                <div className="flex flex-col">
                                    <motion.label htmlFor="email" className="text-sm text-zinc-600 mb-2" variants={fadeUp} viewport={{ once: true }}>
                                        EMAIL ADDRESS
                                    </motion.label>
                                    <motion.input id="email" type="email" placeholder="partner@bluepineapple.com" className="w-full border border-zinc-200 rounded-sm px-4 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-300 transition-colors" variants={fadeUp} viewport={{ once: true }} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex flex-col">
                                    <motion.label htmlFor="phone" className="text-sm text-zinc-600 mb-2" variants={fadeUp} viewport={{ once: true }}>
                                        PHONE NUMBER
                                    </motion.label>
                                    <motion.input id="phone" type="tel" placeholder="+254 700 000 000" className="w-full border border-zinc-200 rounded-sm px-4 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-300 transition-colors" variants={fadeUp} viewport={{ once: true }} />
                                </div>
                                <div className="flex flex-col">
                                    <motion.label htmlFor="subject" className="text-sm text-zinc-600 mb-2" variants={fadeUp} viewport={{ once: true }}>
                                        SUBJECT
                                    </motion.label>
                                    <motion.input id="subject" type="text" placeholder="Partnership Inquiry" className="w-full border border-zinc-200 rounded-sm px-4 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-300 transition-colors" variants={fadeUp} viewport={{ once: true }} />
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <motion.label htmlFor="message" className="text-sm text-zinc-600 mb-2" variants={fadeUp} viewport={{ once: true }}>
                                    MESSAGE
                                </motion.label>
                                <motion.textarea id="message" rows={5} placeholder="Tell us about your plans" className="w-full border border-zinc-200 rounded-sm px-4 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-300 transition-colors resize-none" variants={fadeUp} viewport={{ once: true }} />
                            </div>

                            <motion.div variants={fadeUp} viewport={{ once: true }}>
                                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-950 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-cyan-900 cursor-pointer">
                                    Send Message
                                    <ArrowUpRight size={16} />
                                </button>
                            </motion.div>
                        </form>
                    </motion.div>

                    <motion.div
                        className="relative h-[400px] md:h-[520px] w-full rounded-2xl overflow-hidden"
                        initial={{ y: 50, opacity: 0, scale: 0.96 }}
                        whileInView={{ y: 0, opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15, type: "spring", stiffness: 240, damping: 70, mass: 1 }}
                    >
                        <Image
                            src={publicPath("/assets/set.webp")}
                            alt="Mombasa coastline"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6">
                            <div className="bg-black/40 backdrop-blur-md rounded-xl p-5 border border-white/10">
                                <p className="text-white text-sm font-medium mb-1">Visit us at the marina</p>
                                <p className="text-white/70 text-xs">Mombasa Marina, Mombasa, Kenya</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ============================================
                  FINAL CTA
            ============================================ */}
            <section className="relative py-36 px-4 md:px-16 lg:px-24 xl:px-32 w-full overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src={publicPath("/assets/set.webp")}
                        alt="Sunset coastal experience"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center">
                    <motion.h2
                        className="text-3xl md:text-4xl text-white tracking-tight max-w-[520px] mb-3 font-medium"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
                    >
                        Ready to set sail?
                    </motion.h2>
                    <motion.p
                        className="text-white/70 text-sm md:text-base max-w-[400px] mb-7"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        WhatsApp us to check availability and reserve your spot on any of our coastal experiences.
                    </motion.p>
                    <motion.div
                        className="flex flex-wrap items-center justify-center gap-4"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        <a
                            href="https://wa.me/254708485978?text=Hi%20Blue%20Pineapple%2C%20I'd%20like%20to%20get%20in%20touch"
                            className={primaryButtonClass}
                        >
                            Chat on WhatsApp
                            <ArrowUpRight size={16} />
                        </a>
                        <Link href="/trips" className={invertedButtonClass}>
                            Explore Trips
                        </Link>
                    </motion.div>
                </div>
            </section>
            </main>
            </MarketingShell>
        );
    }
