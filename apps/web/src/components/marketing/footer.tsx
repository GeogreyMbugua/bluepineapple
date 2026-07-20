"use client";

import Image from "next/image";
import Link from "next/link";
import { ROUTES } from '@/config/routes';

const CONTACT = {
    phone: "+254 708 485 978",
    email: "bluepineappleholdings@gmail.com",
    location: "Mombasa Marina, Mombasa, Kenya",
    hours: "Open Daily",
};

const footerNavigation = [
    {
        title: "Explore",
        items: [
            { label: "Home", href: ROUTES.marketing.home },
            { label: "Experiences", href: ROUTES.marketing.experiences },
            { label: "Boats", href: "/boats" },
            { label: "Real Estate", href: "/real-estate" },
        ],
    },
    {
        title: "Company",
        items: [
            { label: "About", href: ROUTES.marketing.about },
            { label: "Services", href: "/services" },
            { label: "Contact", href: ROUTES.marketing.contact },
            { label: "Pricing", href: ROUTES.marketing.pricing },
        ],
    },
    {
        title: "Support",
        items: [
            { label: "Get a Quote", href: ROUTES.marketing.contact },
            { label: "Book a Trip", href: "/trips" },
            { label: "Partner with Us", href: "/partner" },
            { label: "Client Care", href: ROUTES.marketing.contact },
        ],
    },
];

const socials = [
    {
        name: "Instagram",
        href: "https://www.instagram.com/bluepineappleboats",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-5 w-5">
                <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.8c-3.15 0-3.52.01-4.76.07-.87.04-1.34.18-1.65.3-.42.16-.72.36-1.03.67-.31.31-.51.61-.67 1.03-.12.31-.26.78-.3 1.65C3.53 8.48 3.52 8.85 3.52 12s.01 3.52.07 4.76c.04.87.18 1.34.3 1.65.16.42.36.72.67 1.03.31.31.61.51 1.03.67.31.12.78.26 1.65.3 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c.87-.04 1.34-.18 1.65-.3.42-.16.72-.36 1.03-.67.31-.31.51-.61.67-1.03.12-.31.26-.78.3-1.65.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.04-.87-.18-1.34-.3-1.65a2.8 2.8 0 0 0-.67-1.03 2.8 2.8 0 0 0-1.03-.67c-.31-.12-.78-.26-1.65-.3C15.52 3.97 15.15 3.96 12 3.96zm0 3.06A5 5 0 1 1 7 12a5 5 0 0 1 5-5zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4zm5.2-2.06a1.16 1.16 0 1 1 0 2.32 1.16 1.16 0 0 1 0-2.32z" />
            </svg>
        ),
    },
    {
        name: "Facebook",
        href: "https://www.facebook.com/Bluepineappleboats",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-5 w-5">
                <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
            </svg>
        ),
    },
    {
        name: "TikTok",
        href: "https://www.tiktok/@bluepineappleboats",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-5 w-5">
                <path d="M16.6 5.82a4.28 4.28 0 0 1-1.06-2.82h-3.2v13.4a2.4 2.4 0 0 1-2.39 2.4 2.4 2.4 0 0 1-2.4-2.4 2.4 2.4 0 0 1 2.4-2.39V10.6a5.2 5.2 0 0 0-5.2 5.2 5.2 5.2 0 0 0 5.2 5.2 5.2 5.2 0 0 0 5.2-5.2V9.6a7.6 7.6 0 0 0 4.4 1.42V7.8a4.28 4.28 0 0 1-3.95-1.98z" />
            </svg>
        ),
    },
];

export function Footer() {
    const year = new Date().getFullYear();
    const phoneLink = CONTACT.phone.replace(/\s+/g, "");

    return (
        <footer className="border-t border-white/10 bg-[var(--color-navy)] text-white">
            <div className="mx-auto max-w-7xl xl:max-w-[1500px] px-6 lg:px-8 py-10 lg:py-12">
                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-[420px_repeat(3,1fr)] xl:items-start">
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <Link href="/" aria-label="Blue Pineapple Holdings — Home" className="inline-flex items-center gap-3">
                                <Image src="/brand/logo.png" alt="Blue Pineapple Holdings" width={64} height={64} priority className="rounded-2xl border border-white/10 bg-white/5" />
                            </Link>
                            <div>
                                <div className="text-lg font-semibold">Blue Pineapple Holdings Ltd</div>
                                <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-gold)]">Coastal Living. Smart Investments.</div>
                            </div>
                        </div>

                        <p className="max-w-xl text-sm leading-6 text-zinc-300">
                            We create exceptional coastal experiences and premium real estate opportunities across Mombasa and the Kenyan coast.
                        </p>

                        <p className="text-sm text-zinc-300">
                            📍 {CONTACT.location} • {CONTACT.hours}
                        </p>

                        <div className="flex flex-wrap items-center gap-3">
                            {socials.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.name}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-100 transition hover:border-[var(--color-gold)] hover:text-white"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {footerNavigation.map((section) => (
                        <div key={section.title}>
                            <div className="text-sm font-semibold text-white">{section.title}</div>
                            <div className="mt-4 space-y-3 text-sm text-zinc-300">
                                {section.items.map((item) => (
                                    <Link key={item.label} href={item.href} className="block transition hover:text-white">
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 border-t border-white/10 pt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap gap-6 text-sm text-zinc-300">
                        <span>
                            Phone: <a href={`tel:${phoneLink}`} className="text-white transition hover:text-[var(--color-gold)]">{CONTACT.phone}</a>
                        </span>
                        <span>
                            Email: <a href={`mailto:${CONTACT.email}`} className="text-white transition hover:text-[var(--color-gold)]">{CONTACT.email}</a>
                        </span>
                    </div>
                    <p className="text-sm text-zinc-500">© {year} Blue Pineapple Holdings Ltd. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
