'use client';

import { useToast } from '@/providers/toast-provider';

export function Toasts() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`min-w-[300px] max-w-sm rounded-lg border px-4 py-3 shadow-lg ${
            toast.type === 'success'
              ? 'border-green bg-green-light-6 text-green'
              : toast.type === 'error'
                ? 'border-red bg-red-light-5 text-red'
                : toast.type === 'warning'
                  ? 'border-yellow bg-yellow-light-6 text-yellow-dark'
                  : 'border-stroke bg-white text-dark'
          }`}
        >
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
