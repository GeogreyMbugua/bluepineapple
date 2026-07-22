import Link from 'next/link';

import { ArrowRight } from 'lucide-react';

interface ArmPanelProps {
  label: string;
  title: string;
  sub?: string;
  href: string;
  tone: 'sea' | 'navy';
}

export function ArmPanel({ label, title, sub, href, tone }: ArmPanelProps) {
  const isNavy = tone === 'navy';

  return (
    <Link
      href={href}
      aria-label={title}
      className={`group relative flex items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-10 text-center backdrop-blur-md transition-all duration-300 ease-out
      hover:border-white/30 hover:bg-white/[0.06] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 active:scale-[0.98]
      md:flex md:flex-1 md:flex-col md:items-center md:justify-center md:border-0 md:rounded-none md:bg-transparent md:px-10 md:py-0 md:text-left md:backdrop-blur-none md:hover:shadow-none md:hover:-translate-y-0 md:active:scale-100
      `}
    >
      <div className="flex flex-col items-center gap-3">
        <div className={`text-[11px] font-semibold uppercase tracking-[0.22em] md:text-xs ${isNavy ? 'text-[var(--color-gold)]' : 'text-[var(--color-paper)]'}`}>
          {label}
        </div>

        <h3 className="font-serif text-xl leading-snug text-white md:text-3xl">
          {title}
        </h3>

        <div className="mt-1 flex justify-center md:mt-2 md:justify-start">
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
