'use client';

import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-dark">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full border border-stroke bg-white px-3 py-2 text-sm text-dark outline-none transition-colors',
          'placeholder:text-dark-5',
          'focus:border-primary focus:ring-1 focus:ring-primary',
          error && 'border-red',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-red">{error}</p>
      )}
    </div>
  );
}
