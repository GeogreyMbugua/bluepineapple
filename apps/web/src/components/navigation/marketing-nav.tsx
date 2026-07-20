"use client";

import Link from 'next/link';
import { useState } from 'react';
import { ROUTES } from '@/config/routes';

const links = [
  { label: 'Home', href: ROUTES.marketing.home },
  { label: 'Experiences', href: ROUTES.marketing.experiences },
  { label: 'Pricing', href: ROUTES.marketing.pricing },
  { label: 'About', href: ROUTES.marketing.about },
  { label: 'Contact', href: ROUTES.marketing.contact },
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href={ROUTES.marketing.home} className="text-lg font-semibold tracking-[0.2em] text-white">
          BLUE PINEAPPLE
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 md:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          Menu
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-slate-950 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm font-medium text-slate-300">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-white" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
