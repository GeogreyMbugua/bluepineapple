'use client';

import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 text-sm font-medium transition-colors',
        variant === 'primary' && 'bg-primary text-white hover:bg-primary-deep',
        variant === 'secondary' && 'border border-stroke bg-white text-dark hover:bg-muted',
        variant === 'danger' && 'border border-red bg-white text-red hover:bg-red-light-5',
        className
      )}
      {...props}
    />
  );
}
