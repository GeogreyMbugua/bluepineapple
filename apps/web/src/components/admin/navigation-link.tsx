'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';

type NavigationLinkProps = ComponentProps<typeof Link> & {
  disabled?: boolean;
};

export function NavigationLink({
  className,
  disabled,
  ...props
}: NavigationLinkProps) {
  const [isPending] = useTransition();

  return (
    <Link
      className={cn(
        'transition-opacity',
        (isPending || disabled) && 'pointer-events-none opacity-50',
        className,
      )}
      aria-busy={isPending}
      {...props}
    />
  );
}
