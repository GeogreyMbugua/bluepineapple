"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import React, { useState, useEffect } from "react";

import { publicPath } from '@/lib/paths';

type NavVariant = 'parent' | 'coastal' | 'real-estate';

interface NavbarProps {
  readonly variant?: NavVariant;
}

export function Navbar({ variant = 'parent' }: NavbarProps) {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [platformsOpen, setPlatformsOpen] = React.useState(false);
    const [exploreOpen, setExploreOpen] = React.useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const parentLinks = (
        <>
            <Link href="/about" className={`transition-colors duration-500 ${scrolled ? "text-zinc-800 hover:text-zinc-600" : "text-white hover:text-white/90"}`}>About</Link>
            <Link href="/services" className={`transition-colors duration-500 ${scrolled ? "text-zinc-800 hover:text-zinc-600" : "text-white hover:text-white/90"}`}>Services</Link>
            <Link href="/contact" className={`transition-colors duration-500 ${scrolled ? "text-zinc-800 hover:text-zinc-600" : "text-white hover:text-white/90"}`}>Contact</Link>
        </>
    );

    const coastalLinks = (
        <>
            <Link href="/trips" className={`transition-colors duration-500 ${scrolled ? "text-zinc-800 hover:text-zinc-600" : "text-white hover:text-white/90"}`}>Experiences</Link>
            <Link href="/trips/fort-jesus-trip" className={`transition-colors duration-500 ${scrolled ? "text-zinc-800 hover:text-zinc-600" : "text-white hover:text-white/90"}`}>Fort Jesus</Link>
            <Link href="/boats" className={`transition-colors duration-500 ${scrolled ? "text-zinc-800 hover:text-zinc-600" : "text-white hover:text-white/90"}`}>Our Fleet</Link>
            <Link href="/gallery" className={`transition-colors duration-500 ${scrolled ? "text-zinc-800 hover:text-zinc-600" : "text-white hover:text-white/90"}`}>Gallery</Link>
            <Link href="/contact" className={`transition-colors duration-500 ${scrolled ? "text-zinc-800 hover:text-zinc-600" : "text-white hover:text-white/90"}`}>Contact</Link>
        </>
    );

    const realEstateLinks = (
        <>
            <a href="#properties" className={`transition-colors duration-500 ${scrolled ? "text-zinc-800 hover:text-zinc-600" : "text-white hover:text-white/90"}`}>Properties</a>
            <a href="#investments" className={`transition-colors duration-500 ${scrolled ? "text-zinc-800 hover:text-zinc-600" : "text-white hover:text-white/90"}`}>Investments</a>
            <a href="#contact" className={`transition-colors duration-500 ${scrolled ? "text-zinc-800 hover:text-zinc-600" : "text-white hover:text-white/90"}`}>Contact</a>
            <div className="relative">
                <button onClick={() => setPlatformsOpen((v) => !v)} className={`transition-colors duration-500 ${scrolled ? "text-zinc-800 hover:text-zinc-600" : "text-white hover:text-white/90"}`}>Platform</button>
                {platformsOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 rounded-md border border-zinc-200 bg-white py-2 shadow-lg">
                        <Link href="/coastal-experiences" className="block px-4 py-2 text-xs text-zinc-700 hover:bg-zinc-50" onClick={() => setPlatformsOpen(false)}>Coastal Experiences</Link>
                        <Link href="/real-estate" className="block px-4 py-2 text-xs text-zinc-700 hover:bg-zinc-50" onClick={() => setPlatformsOpen(false)}>Real Estate</Link>
                    </div>
                )}
            </div>
        </>
    );

    const desktopLinks = variant === 'coastal' ? coastalLinks : variant === 'real-estate' ? realEstateLinks : parentLinks;

    const mobileLinks = variant === 'coastal' ? (
        <>
            <Link href="/trips" onClick={() => { setMobileOpen(false) }} className={`transition-colors duration-500 ${scrolled ? "text-zinc-800 hover:text-zinc-600" : "text-white hover:text-white/90"}`}>Experiences</Link>
            <Link href="/trips/fort-jesus-trip" onClick={() => { setMobileOpen(false) }} className={`transition-colors duration-500 ${scrolled ? "text-zinc-800 hover:text-zinc-600" : "text-white hover:text-white/90"}`}>Fort Jesus</Link>
            <Link href="/boats" onClick={() => { setMobileOpen(false) }} className={`transition-colors duration-500 ${scrolled ? "text-zinc-800 hover:text-zinc-600" : "text-white hover:text-white/90"}`}>Our Fleet</Link>
            <Link href="/gallery" onClick={() => { setMobileOpen(false) }} className={`transition-colors duration-500 ${scrolled ? "text-zinc-800 hover:text-zinc-600" : "text-white hover:text-white/90"}`}>Gallery</Link>
            <Link href="/contact" onClick={() => { setMobileOpen(false) }} className={`transition-colors duration-500 ${scrolled ? "text-zinc-800 hover:text-zinc-600" : "text-white hover:text-white/90"}`}>Contact</Link>
        </>
    ) : variant === 'real-estate' ? (
        <>
            <Link href="#properties" onClick={() => { setMobileOpen(false) }} className={`transition-colors duration-500 ${scrolled ? "text-zinc-800 hover:text-zinc-600" : "text-white hover:text-white/90"}`}>Properties</Link>
            <Link href="#investments" onClick={() => { setMobileOpen(false) }} className={`transition-colors duration-500 ${scrolled ? "text-zinc-800 hover:text-zinc-600" : "text-white hover:text-white/90"}`}>Investments</Link>
            <Link href="/coastal-experiences" onClick={() => { setMobileOpen(false) }} className={`transition-colors duration-500 ${scrolled ? "text-zinc-800 hover:text-zinc-600" : "text-white hover:text-white/90"}`}>Coastal Experiences</Link>
            <Link href="/real-estate" onClick={() => { setMobileOpen(false) }} className={`transition-colors duration-500 ${scrolled ? "text-zinc-800 hover:text-zinc-600" : "text-white hover:text-white/90"}`}>Real Estate</Link>
            <a href="#contact" onClick={() => { setMobileOpen(false) }} className={`transition-colors duration-500 ${scrolled ? "text-zinc-800 hover:text-zinc-600" : "text-white hover:text-white/90"}`}>Contact</a>
        </>
    ) : (
        <>
            <Link href="/about" onClick={() => { setMobileOpen(false) }} className={`transition-colors duration-500 ${scrolled ? "text-zinc-800 hover:text-zinc-600" : "text-white hover:text-white/90"}`}>About</Link>
            <Link href="/services" onClick={() => { setMobileOpen(false) }} className={`transition-colors duration-500 ${scrolled ? "text-zinc-800 hover:text-zinc-600" : "text-white hover:text-white/90"}`}>Services</Link>
            <Link href="/coastal-experiences" onClick={() => { setMobileOpen(false) }} className={`transition-colors duration-500 ${scrolled ? "text-zinc-800 hover:text-zinc-600" : "text-white hover:text-white/90"}`}>Coastal Experiences</Link>
            <Link href="/real-estate" onClick={() => { setMobileOpen(false) }} className={`transition-colors duration-500 ${scrolled ? "text-zinc-800 hover:text-zinc-600" : "text-white hover:text-white/90"}`}>Real Estate</Link>
            <a href="/contact" onClick={() => { setMobileOpen(false) }} className={`transition-colors duration-500 ${scrolled ? "text-zinc-800 hover:text-zinc-600" : "text-white hover:text-white/90"}`}>Contact</a>
        </>
    );

    return (
        <>
            <nav className={`fixed z-50 flex items-center justify-between left-1/2 -translate-x-1/2 transition-all duration-500 w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 xl:px-16 ${scrolled ? "bg-white/60 backdrop-blur-2xl  mt-4 pl-6 shadow" : ""}`}>
                <Link href="/" aria-label="Blue Pineapple Holdings — Home">
                    <Image width={140} height={140} src={publicPath("/logos/bplogo.png")} alt="Blue Pineapple Holdings" className={`transition-all duration-500 h-11 w-auto sm:h-12 ${scrolled ? "invert opacity-80" : ""}`} />
                </Link>

                {/* Desktop links */}
                <div className="hidden md:flex items-center gap-3 lg:gap-4 text-xs">
                    {desktopLinks}
                </div>

                <div
                    className="group hidden md:block relative"
                    onMouseEnter={() => setExploreOpen(true)}
                    onMouseLeave={() => setExploreOpen(false)}
                >
                    <button
                        type="button"
                        aria-expanded={exploreOpen}
                        onClick={() => setExploreOpen((v) => !v)}
                        className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-500 ${scrolled ? "bg-cyan-950 text-white hover:bg-cyan-900" : "bg-white text-cyan-950 hover:bg-cyan-100"}`}
                    >
                        Explore Platforms
                        <ChevronDown size={14} className={`transition-transform duration-300 ${exploreOpen ? "rotate-180" : ""}`} />
                    </button>
                    <div
                        className={`absolute top-full right-0 pt-2 w-52 transition-all duration-200 ${exploreOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-1 invisible pointer-events-none"}`}
                    >
                        <div className="overflow-hidden rounded-xl bg-white/95 backdrop-blur-md shadow-lg ring-1 ring-black/5">
                            <Link href="/coastal-experiences" onClick={() => setExploreOpen(false)} className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-cyan-950 hover:text-white transition-colors">
                                Coastal Experiences
                                <span className="size-1.5 rounded-full bg-cyan-500" />
                            </Link>
                            <Link href="/real-estate" onClick={() => setExploreOpen(false)} className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-cyan-950 hover:text-white transition-colors">
                                Real Estate
                                <span className="size-1.5 rounded-full bg-cyan-500" />
                            </Link>
                        </div>
                    </div>
                </div>

                <button onClick={() => setMobileOpen(true)} className={`md:hidden p-2 rounded-md aspect-square font-medium transition cursor-pointer ${scrolled ? "text-zinc-800" : "text-white"}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12h16" /><path d="M4 18h16" /><path d="M4 6h16" />
                    </svg>
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={`${mobileOpen ? 'max-md:w-full' : 'max-md:w-0'} md:hidden max-md:fixed max-md:top-0 max-md:z-50 max-md:left-0 max-md:transition-all max-md:duration-300 max-md:overflow-hidden max-md:h-full max-md:bg-white/5 max-md:backdrop-blur max-md:flex-col max-md:justify-center flex items-center gap-6 md:gap-10 text-sm`}>
                {mobileLinks}

                <button onClick={() => setMobileOpen(false)} className="md:hidden bg-white text-zinc-800 p-2 rounded-md aspect-square font-medium transition cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                    </svg>
                </button>
            </div>
        </>
    );
}