"use client";

import Link from "next/link";
import Image from "next/image";
import { publicPath } from "@/lib/paths";

export function LandingHeader() {
    return (
        <header className="absolute top-0 left-0 right-0 z-50 w-full">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-8 lg:px-12">
                {/* Logo */}
                <Link href="/" aria-label="Blue Pineapple Holdings — Home">
                    <Image
                        src={publicPath("/logos/bplogo.png")}
                        alt="Blue Pineapple"
                        width={120}
                        height={120}
                        className="h-9 w-auto sm:h-10"
                    />
                </Link>

                {/* Portal Links */}
                <nav className="flex items-center gap-3" aria-label="Portal navigation">
                    <Link
                        href="/partner/login"
                        className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-5 py-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 hover:border-white/50"
                    >
                        Partner Portal
                    </Link>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-2 text-xs font-semibold text-white/70 backdrop-blur-sm transition hover:text-white hover:border-white/30"
                    >
                        Admin
                    </Link>
                </nav>
            </div>
        </header>
    );
}
