import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { ExperiencesIcon, RealEstateIcon } from './ArmIcons';

interface ArmPanelProps {
  label: string;
  title: string;
  sub?: string;
  href: string;
  tone: 'sea' | 'navy';
}

export function ArmPanel({ label, title, sub, href, tone }: ArmPanelProps) {
  const isNavy = tone === 'navy';
  const accent = isNavy ? 'text-[var(--color-gold)]' : 'text-[var(--color-sea)]';
  const border = isNavy
    ? 'border-[var(--color-gold)]/55'
    : 'border-[var(--color-sea)]/55';
  const Icon = isNavy ? RealEstateIcon : ExperiencesIcon;

  return (
    <Link
      href={href}
      aria-label={title}
      className={`group relative block overflow-hidden rounded-xl border bg-white/[0.03] p-5 backdrop-blur-sm transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-navy-deep)] active:scale-[0.99] md:flex md:flex-1 md:flex-col md:items-center md:justify-center md:rounded-none md:border-0 md:bg-transparent md:p-0 md:px-10 md:py-0 md:backdrop-blur-none md:active:scale-100 ${border} hover:bg-white/[0.05] md:hover:bg-transparent`}
    >
      {/* Mobile — mockup: icon | copy | arrow */}
      <div className="flex min-h-[132px] w-full items-center gap-3 md:hidden">
        <div className="flex w-[28%] shrink-0 items-center justify-center">
          <Icon className={`size-14 ${accent}`} />
        </div>

        <span
          className={`h-16 w-px shrink-0 ${isNavy ? 'bg-[var(--color-gold)]/25' : 'bg-[var(--color-sea)]/25'}`}
          aria-hidden
        />

        <div className="flex min-w-0 flex-1 flex-col text-left">
          <span className={`text-[10px] font-medium uppercase tracking-[0.22em] ${accent}`}>
            {label}
          </span>

          <h3 className="mt-2 font-serif text-lg font-semibold leading-snug text-white">
            {title}
          </h3>

          {sub ? (
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-white/55">
              {sub}
            </p>
          ) : null}
        </div>

        <span className={`flex shrink-0 items-center self-center pl-1 ${accent}`}>
          <ArrowRight className="size-5 transition-transform duration-300 ease-out group-hover:translate-x-1" />
        </span>
      </div>

      {/* Desktop — approved centered composition */}
      <div className="hidden flex-col items-center gap-3 text-center md:flex">
        <div
          className={`text-xs font-semibold uppercase tracking-[0.22em] ${
            isNavy ? 'text-[var(--color-gold)]' : 'text-[var(--color-paper)]'
          }`}
        >
          {label}
        </div>

        <h3 className="font-serif text-3xl leading-snug text-white">{title}</h3>

        <div className="mt-2 flex justify-start">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
              isNavy
                ? 'border-[var(--color-gold)]/70 text-[var(--color-paper)] group-hover:bg-[var(--color-gold)] group-hover:text-[var(--color-navy-deep)]'
                : 'border-[var(--color-paper)]/50 text-[var(--color-paper)] group-hover:bg-[var(--color-paper)] group-hover:text-[var(--color-navy-deep)]'
            }`}
          >
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default ArmPanel;
