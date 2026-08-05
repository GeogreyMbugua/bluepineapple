'use client';

import { useState } from 'react';
import { PartnerSidebar } from './partner-sidebar';
import { PartnerHeader } from './partner-header';

export function PartnerLayout({ children }: { readonly children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <PartnerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col min-w-0">
        <PartnerHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
