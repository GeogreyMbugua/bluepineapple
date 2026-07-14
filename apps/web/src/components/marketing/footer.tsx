"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Phone, Mail, MapPin, Clock } from "lucide-react";
import { publicPath } from "@/lib/paths";
import { ROUTES } from "@/config/routes";

const exploreLinks = [
    { label: "Home", href: ROUTES.marketing.home },
    { label: "About", href: ROUTES.marketing.about },
    { label: "Experiences", href: "/coastal-experiences" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: ROUTES.marketing.contact },
];

const experienceLinks = [
    { label: "Glass Bottom Boat", href: "/boats" },
    { label: "Sunset Cruises", href: "/trips/sunset-sailing" },
    { label: "Fort Jesus Tours", href: "/trips/fort-jesus-trip" },
    { label: "Snorkeling Reef", href: "/trips/snorkelling-reef" },
    { label: "Private Events", href: "/trips/birthdays-anniversaries" },
];

const CONTACT = {
    phone: "+254 708 485 978",
    email: "bluepineappleholdings@gmail.com",
    location: "Mombasa Marina, Mombasa, Kenya",
    hours: "Open Daily",
};

const socials = [
    {
        name: "Instagram",
        href: "https://www.instagram.com/bluepineappleboats",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-4">
                <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.8c-3.15 0-3.52.01-4.76.07-.87.04-1.34.18-1.65.3-.42.16-.72.36-1.03.67-.31.31-.51.61-.67 1.03-.12.31-.26.78-.3 1.65C3.53 8.48 3.52 8.85 3.52 12s.01 3.52.07 4.76c.04.87.18 1.34.3 1.65.16.42.36.72.67 1.03.31.31.61.51 1.03.67.31.12.78.26 1.65.3 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c.87-.04 1.34-.18 1.65-.3.42-.16.72-.36 1.03-.67.31-.31.51-.61.67-1.03.12-.31.26-.78.3-1.65.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.04-.87-.18-1.34-.3-1.65a2.8 2.8 0 0 0-.67-1.03 2.8 2.8 0 0 0-1.03-.67c-.31-.12-.78-.26-1.65-.3C15.52 3.97 15.15 3.96 12 3.96zm0 3.06A5 5 0 1 1 7 12a5 5 0 0 1 5-5zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4zm5.2-2.06a1.16 1.16 0 1 1 0 2.32 1.16 1.16 0 0 1 0-2.32z" />
            </svg>
        ),
    },
    {
        name: "Facebook",
        href: "https://www.facebook.com/Bluepineappleboats",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-4">
                <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
            </svg>
        ),
    },
    {
        name: "TikTok",
        href: "https://www.tiktok/@bluepineappleboats",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-4">
                <path d="M16.6 5.82a4.28 4.28 0 0 1-1.06-2.82h-3.2v13.4a2.4 2.4 0 0 1-2.39 2.4 2.4 2.4 0 0 1-2.4-2.4 2.4 2.4 0 0 1 2.4-2.39V10.6a5.2 5.2 0 0 0-5.2 5.2 5.2 5.2 0 0 0 5.2 5.2 5.2 5.2 0 0 0 5.2-5.2V9.6a7.6 7.6 0 0 0 4.4 1.42V7.8a4.28 4.28 0 0 1-3.95-1.98z" />
            </svg>
        ),
    },
];

export function Footer() {
    return (
        <footer className="relative overflow-hidden">
            {/* ============================================
                  MAIN FOOTER CONTENT
            ============================================ */}
            <div className="bg-[#052B42] text-zinc-300 px-4 md:px-16 lg:px-24 xl:px-32 w-full">
                <div className="max-w-7xl mx-auto py-10 md:py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
                        {/* Brand */}
                        <div className="lg:col-span-4 flex flex-col items-start gap-4">
                            <Link href="/" className="select-none" aria-label="Blue Pineapple Holdings — Home">
                                <Image src={publicPath("/logos/bplogo.png")} alt="Blue Pineapple Holdings" width={120} height={120} className="h-8 w-auto" style={{ width: "auto", height: "auto" }} />
                            </Link>
                            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
                                Creating unforgettable coastal experiences through premium boat tours, snorkeling adventures, private charters, and authentic Kenyan hospitality.
                            </p>

                            {/* Social */}
                            <div className="flex items-center gap-2.5 pt-1">
                                {socials.map((social) => (
                                    <a
                                        key={social.name}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={social.name}
                                        className="size-9 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 transition-all duration-300 hover:text-white hover:border-[#C8A96A] hover:bg-white/5 hover:-translate-y-1 hover:scale-105"
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Explore */}
                        <div className="lg:col-span-2 lg:col-start-6">
                            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white mb-4 block">Explore</span>
                            <div className="flex flex-col gap-2.5">
                                {exploreLinks.map((link) => (
                                    <Link key={link.label} href={link.href} className="group flex items-center gap-2 text-sm text-zinc-400 transition-colors duration-200 hover:text-white w-fit">
                                        {link.label}
                                        <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-0.5 opacity-0 group-hover:opacity-100" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Experiences */}
                        <div className="lg:col-span-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white mb-4 block">Experiences</span>
                            <div className="flex flex-col gap-2.5">
                                {experienceLinks.map((link) => (
                                    <Link key={link.label} href={link.href} className="group flex items-center gap-2 text-sm text-zinc-400 transition-colors duration-200 hover:text-white w-fit">
                                        {link.label}
                                        <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-0.5 opacity-0 group-hover:opacity-100" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="lg:col-span-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white mb-4 block">Contact</span>
                            <div className="flex flex-col gap-3">
                                <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className="group flex items-start gap-3 text-sm text-zinc-400 transition-colors duration-200 hover:text-white">
                                    <Phone className="size-4 mt-0.5 shrink-0 text-[#C8A96A]" />
                                    <span>{CONTACT.phone}</span>
                                </a>
                                <a href={`mailto:${CONTACT.email}`} className="group flex items-start gap-3 text-sm text-zinc-400 transition-colors duration-200 hover:text-white">
                                    <Mail className="size-4 mt-0.5 shrink-0 text-[#C8A96A]" />
                                    <span>{CONTACT.email}</span>
                                </a>
                                <div className="flex items-start gap-3 text-sm text-zinc-400">
                                    <MapPin className="size-4 mt-0.5 shrink-0 text-[#C8A96A]" />
                                    <span>{CONTACT.location}</span>
                                </div>
                                <div className="flex items-start gap-3 text-sm text-zinc-400">
                                    <Clock className="size-4 mt-0.5 shrink-0 text-[#C8A96A]" />
                                    <span>{CONTACT.hours}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust Strip */}
                <div className="border-t border-zinc-800/60">
                    <div className="max-w-7xl mx-auto py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-500">
                        <span className="flex items-center gap-2">
                            <span className="text-[#C8A96A]">&#9733;</span>
                            Trusted by 1000+ Guests
                        </span>
                        <span className="hidden sm:inline text-zinc-800">|</span>
                        <span>Fully Licensed</span>
                        <span className="hidden sm:inline text-zinc-800">|</span>
                        <span>Professional Crew</span>
                        <span className="hidden sm:inline text-zinc-800">|</span>
                        <span>Safety First</span>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-zinc-800/60">
                    <div className="max-w-7xl mx-auto py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-zinc-500">
                        <p>Copyright 2026 &copy; Blue Pineapple Holdings. All rights reserved.</p>
                        <p className="text-zinc-600">Proudly creating coastal experiences in Kenya.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
