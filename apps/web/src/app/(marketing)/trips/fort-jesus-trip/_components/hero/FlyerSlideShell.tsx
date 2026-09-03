import type { ReactNode } from 'react';

type FlyerSlideShellProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly label: string;
};

/** Consistent trip-guide frame — fluid height on mobile, 16:10 from tablet up. */
export function FlyerSlideShell({ children, className = '', label }: FlyerSlideShellProps) {
  return (
    <article
      aria-label={label}
      className={[
        'relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-[#faf8f4] shadow-[0_18px_50px_-28px_rgba(15,23,42,0.55)]',
        'min-h-[22rem] sm:min-h-0 sm:aspect-[16/10]',
        className,
      ].join(' ')}
    >
      {children}
    </article>
  );
}
