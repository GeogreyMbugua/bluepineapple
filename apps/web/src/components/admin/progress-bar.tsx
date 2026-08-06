'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ProgressBar() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsVisible(true);
    const timer = setTimeout(() => setIsVisible(false), 400);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-[100] h-1 bg-gray-100"
        aria-hidden="true"
      >
        <div className="h-full w-full max-w-[70%] animate-progress bg-cyan" />
      </div>
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 z-[99] mt-2"
        aria-label="Loading"
      >
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan border-t-transparent" />
      </div>
    </>
  );
}
