'use client';

import { useTransition } from 'react';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import Link from 'next/link';
import { useSidebarContext } from './sidebar-context';

const menuItemBaseStyles = cva(
  'px-3.5 font-medium text-dark-4 transition-all duration-200',
  {
    variants: {
      isActive: {
        true: 'bg-cyan/10 text-primary-deep',
        false:
          'hover:bg-muted hover:text-dark',
      },
    },
    defaultVariants: {
      isActive: false,
    },
  },
);

export function MenuItem(
  props: {
    className?: string;
    children: React.ReactNode;
    isActive: boolean;
  } & ({ as?: 'button'; onClick: () => void } | { as: 'link'; href: string }),
) {
  const { toggleSidebar, isMobile } = useSidebarContext();
  const [isPending] = useTransition();

  if (props.as === 'link') {
    return (
      <Link
        href={props.href}
        onClick={() => isMobile && toggleSidebar()}
        aria-busy={isPending}
        className={cn(
          menuItemBaseStyles({
            isActive: props.isActive,
            className: 'relative block py-2',
          }),
          props.className,
          isPending && 'pointer-events-none opacity-50',
        )}
      >
        {props.children}
      </Link>
    );
  }

  return (
    <button
      onClick={props.onClick}
      aria-expanded={props.isActive}
      className={menuItemBaseStyles({
        isActive: props.isActive,
        className: 'flex w-full items-center gap-3 py-3',
      })}
    >
      {props.children}
    </button>
  );
}
