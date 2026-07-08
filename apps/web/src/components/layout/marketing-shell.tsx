import type { ReactNode } from 'react';
import { MarketingNav } from '@/components/navigation/marketing-nav';

interface MarketingShellProps {
  children: ReactNode;
}

export function MarketingShell({ children }: MarketingShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <div className="flex-1">{children}</div>
    </div>
  );
}
