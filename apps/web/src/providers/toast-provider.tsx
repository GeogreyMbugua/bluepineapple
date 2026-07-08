'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

/**
 * Toast notification shape.
 */
interface Toast {
  readonly id: string;
  readonly message: string;
  readonly type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastContextValue {
  readonly toasts: readonly Toast[];
  readonly addToast: (message: string, type?: Toast['type']) => void;
  readonly removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * Toast provider stub.
 *
 * Manages toast state in memory. The actual toast UI component will be
 * built in a future phase. This establishes the context contract.
 */
export function ToastProvider({ children }: { readonly children: ReactNode }) {
  const [toasts, setToasts] = useState<readonly Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
