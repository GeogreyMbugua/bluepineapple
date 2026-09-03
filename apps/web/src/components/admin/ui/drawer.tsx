'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-md',
}: DrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close drawer"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <aside
        className={cn(
          'absolute right-0 top-0 flex h-full w-full flex-col border-l border-stroke bg-white shadow-2xl',
          maxWidth,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <div className="flex items-start justify-between border-b border-stroke px-6 py-4">
          <div>
            <h2 id="drawer-title" className="text-lg font-bold text-dark">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-dark-6">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-dark-5 transition hover:bg-muted hover:text-dark"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </aside>
    </div>
  );
}
