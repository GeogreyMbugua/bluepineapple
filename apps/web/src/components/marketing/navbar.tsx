"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, X } from "lucide-react";
import React, { useEffect } from "react";

import { publicPath } from '@/lib/paths';

type NavVariant = 'parent' | 'coastal' | 'real-estate';

interface NavbarProps {
  readonly variant?: NavVariant;
}

export function Navbar({ variant = 'parent' }: NavbarProps) {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [exploreOpen, setExploreOpen] = React.useState(false);

    useEffect(() => {
        if (!mobileOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [mobileOpen]);

    const linkClass = "transition-colors duration-500 text-zinc-800 hover:text-zinc-600";

    const parentLinks = (
        <>
            <Link href="/about" className={linkClass}>About</Link>
            <Link href="/services" className={linkClass}>Services</Link>
            <Link href="/contact" className={linkClass}>Contact</Link>
        </>
    );

    const coastalLinks = (
        <>
            <Link href="/trips" className={linkClass}>Experiences</Link>
            <Link href="/trips/fort-jesus-trip" className={linkClass}>Fort Jesus</Link>
            <Link href="/boats" className={linkClass}>Our Fleet</Link>
            <Link href="/coastal-experiences#reviews" className={linkClass}>Reviews</Link>
            <Link href="/coastal-experiences#gallery" className={linkClass}>Gallery</Link>
            <Link href="/contact" className={linkClass}>Contact</Link>
        </>
    );

    const realEstateLinks = (
        <>
            <a href="#properties" className={linkClass}>Properties</a>
            <a href="#investments" className={linkClass}>Investments</a>
            <a href="#contact" className={linkClass}>Contact</a>
        </>
    );

    const desktopLinks = variant === 'coastal' ? coastalLinks : variant === 'real-estate' ? realEstateLinks : parentLinks;

    const closeMobile = () => setMobileOpen(false);

    const mobileLinkClass = "text-lg font-medium text-zinc-900 transition-colors hover:text-zinc-600";

    const mobileLinks = variant === 'coastal' ? (
        <>
            <Link href="/trips" onClick={closeMobile} className={mobileLinkClass}>Experiences</Link>
            <Link href="/trips/fort-jesus-trip" onClick={closeMobile} className={mobileLinkClass}>Fort Jesus</Link>
            <Link href="/boats" onClick={closeMobile} className={mobileLinkClass}>Our Fleet</Link>
            <Link href="/coastal-experiences#reviews" onClick={closeMobile} className={mobileLinkClass}>Reviews</Link>
            <Link href="/coastal-experiences#gallery" onClick={closeMobile} className={mobileLinkClass}>Gallery</Link>
            <Link href="/contact" onClick={closeMobile} className={mobileLinkClass}>Contact</Link>
            <div className="mt-4 flex w-full max-w-xs flex-col gap-2 border-t border-zinc-200 pt-6">
                <span className="mb-1 text-xs font-medium tracking-[0.2em] text-zinc-400 uppercase">Portals</span>
                <Link href="/partner/login" onClick={closeMobile} className="text-lg font-semibold text-cyan-900 hover:text-cyan-950">Partner Portal</Link>
                <Link href="/login" onClick={closeMobile} className={mobileLinkClass}>Admin Portal</Link>
            </div>
        </>
    ) : variant === 'real-estate' ? (
        <>
            <Link href="#properties" onClick={closeMobile} className={mobileLinkClass}>Properties</Link>
            <Link href="#investments" onClick={closeMobile} className={mobileLinkClass}>Investments</Link>
            <a href="#contact" onClick={closeMobile} className={mobileLinkClass}>Contact</a>
            <div className="mt-4 flex w-full max-w-xs flex-col gap-2 border-t border-zinc-200 pt-6">
                <span className="mb-1 text-xs font-medium tracking-[0.2em] text-zinc-400 uppercase">Portals</span>
                <Link href="/partner/login" onClick={closeMobile} className="text-lg font-semibold text-cyan-900 hover:text-cyan-950">Partner Portal</Link>
                <Link href="/login" onClick={closeMobile} className={mobileLinkClass}>Admin Portal</Link>
            </div>
        </>
    ) : (
        <>
            <Link href="/about" onClick={closeMobile} className={mobileLinkClass}>About</Link>
            <Link href="/services" onClick={closeMobile} className={mobileLinkClass}>Services</Link>
            <Link href="/coastal-experiences" onClick={closeMobile} className={mobileLinkClass}>Coastal Experiences</Link>
            <Link href="/real-estate" onClick={closeMobile} className={mobileLinkClass}>Real Estate</Link>
            <Link href="/contact" onClick={closeMobile} className={mobileLinkClass}>Contact</Link>
            <div className="mt-4 flex w-full max-w-xs flex-col gap-2 border-t border-zinc-200 pt-6">
                <span className="mb-1 text-xs font-medium tracking-[0.2em] text-zinc-400 uppercase">Portals</span>
                <Link href="/partner/login" onClick={closeMobile} className="text-lg font-semibold text-cyan-900 hover:text-cyan-950">Partner Portal</Link>
                <Link href="/login" onClick={closeMobile} className={mobileLinkClass}>Admin Portal</Link>
            </div>
        </>
    );

    return (
        <>
            <nav className={`fixed z-50 mx-auto flex w-full max-w-7xl items-center justify-between left-1/2 -translate-x-1/2 mt-4 bg-white/85 px-4 backdrop-blur-md md:px-8 lg:px-12 xl:px-16 rounded-full border border-black/5 shadow-sm`}>
                <Link href="/" aria-label="Blue Pineapple Holdings — Home">
                    <Image width={120} height={120} src={publicPath("/brand/logo.png")} alt="Blue Pineapple Holdings" className="h-11 w-auto transition-all duration-500 sm:h-12" />
                </Link>

                <div className="hidden items-center gap-3 text-xs md:flex lg:gap-6 font-medium">
                    {desktopLinks}
                </div>

                <div className="hidden md:flex items-center gap-2 sm:gap-3">
                    <Link
                        href="/partner/login"
                        className="inline-flex cursor-pointer items-center justify-center rounded-full border border-cyan-900/20 bg-cyan-900/10 px-4 py-2 text-xs font-semibold text-cyan-950 transition hover:bg-cyan-900 hover:text-white"
                    >
                        Partner Portal
                    </Link>

                    <Link
                        href="/login"
                        className="inline-flex cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-zinc-100/80 px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-200 hover:text-zinc-900"
                    >
                        Admin
                    </Link>

                    <div
                        className="group relative hidden lg:block"
                        onMouseEnter={() => setExploreOpen(true)}
                        onMouseLeave={() => setExploreOpen(false)}
                    >
                        <button
                            type="button"
                            aria-expanded={exploreOpen}
                            onClick={() => setExploreOpen((v) => !v)}
                            className="inline-flex cursor-pointer items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-all duration-500 bg-cyan-950 text-white hover:bg-cyan-900 rounded-full"
                        >
                            Platforms
                            <ChevronDown size={14} className={`transition-transform duration-300 ${exploreOpen ? "rotate-180" : ""}`} />
                        </button>
                        <div
                            className={`absolute top-full right-0 w-56 pt-2 transition-all duration-200 ${exploreOpen ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-1 opacity-0"}`}
                        >
                            <div className="overflow-hidden bg-white/95 shadow-lg ring-1 ring-black/5 backdrop-blur-md rounded-2xl p-1">
                                <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">Platforms</div>
                                <Link href="/coastal-experiences" onClick={() => setExploreOpen(false)} className="flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-800 rounded-xl transition-colors hover:bg-cyan-950 hover:text-white">
                                    Coastal Experiences
                                    <span className="size-1.5 rounded-full bg-cyan-500" />
                                </Link>
                                <Link href="/real-estate" onClick={() => setExploreOpen(false)} className="flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-800 rounded-xl transition-colors hover:bg-cyan-950 hover:text-white">
                                    Real Estate
                                    <span className="size-1.5 rounded-full bg-cyan-500" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    aria-label="Open menu"
                    aria-expanded={mobileOpen}
                    onClick={() => setMobileOpen(true)}
                    className="aspect-square cursor-pointer p-2 font-medium text-zinc-800 transition md:hidden"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M4 12h16" /><path d="M4 18h16" /><path d="M4 6h16" />
                    </svg>
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-white px-8 transition-all duration-300 md:hidden ${
                    mobileOpen ? "visible opacity-100" : "pointer-events-none invisible opacity-0"
                }`}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation"
            >
                <button
                    type="button"
                    aria-label="Close menu"
                    onClick={closeMobile}
                    className="absolute top-5 right-4 rounded-md bg-zinc-100 p-2 text-zinc-800 transition hover:bg-zinc-200"
                >
                    <X className="size-5" />
                </button>

                {mobileLinks}
            </div>
        </>
    );
}
