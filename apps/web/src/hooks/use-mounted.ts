'use client';

import { useEffect, useState } from 'react';

/**
 * Track whether the component has mounted.
 *
 * Useful for avoiding hydration mismatches when rendering differs
 * between server and client (e.g., browser-only features).
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return mounted;
}
