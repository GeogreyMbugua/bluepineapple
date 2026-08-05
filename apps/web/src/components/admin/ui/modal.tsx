'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-2xl' }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className={cn('relative w-full mx-4 border border-stroke bg-white shadow-2', maxWidth)}>
        <div className="flex items-center justify-between border-b border-stroke px-6 py-4">
          <h2 className="text-lg font-bold text-dark">{title}</h2>
          <button
            onClick={onClose}
            className="text-dark-5 hover:text-dark"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
