'use client';

import { useEffect, useRef } from 'react';

export function useClickOutside<T extends HTMLElement>(
  callback: () => void,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handler = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (ref.current && !ref.current.contains(target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [callback]);

  return ref;
}
