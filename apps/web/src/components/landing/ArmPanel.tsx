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
  return (
    <Link
      href={href}
      aria-label={title}
      className="group flex flex-1 flex-col justify-center px-6 py-10 text-center transition-colors
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]
      focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-navy-deep)]
      md:px-10 md:py-0 md:text-left"
    >
      <div className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--color-gold)] md:text-sm">
        {label}
      </div>

      <h3 className="mt-3 font-serif text-2xl leading-tight text-white md:text-3xl">
        {title}
      </h3>

      {sub ? (
        <p className="mx-auto mt-2 max-w-xs text-sm text-white/85 md:mx-0">{sub}</p>
      ) : null}

      {/*
        Ghost/outline button instead of a solid filled one on a white card —
        reads as a clean, minimal action directly on the photo rather than
        another boxed element. Fills solid only on hover, as the interaction
        cue, not a resting-state box.
      */}
      <div className="mt-6 flex justify-center md:justify-start">
        <span
          className={`inline-flex items-center gap-3 rounded-full border px-5 py-3 text-sm font-medium transition-colors ${
            tone === 'sea'
              ? 'border-[var(--color-paper)]/50 text-[var(--color-paper)] group-hover:bg-[var(--color-paper)] group-hover:text-[var(--color-navy-deep)]'
              : 'border-[var(--color-gold)] text-[var(--color-paper)] group-hover:bg-[var(--color-gold)] group-hover:text-[var(--color-navy-deep)]'
          }`}
        >
          {tone === 'sea' ? 'Explore Coastal Experiences' : 'Explore Real Estate'}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

export default ArmPanel;