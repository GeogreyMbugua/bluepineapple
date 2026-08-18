'use client';

import { Sidebar } from './sidebar';
import { Header } from './header';
import { SidebarProvider } from './sidebar/sidebar-context';
import { ProgressBar } from '@/components/admin/progress-bar';

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ProgressBar />
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="w-full bg-surface-secondary">
          <Header />
          <main className="isolate mx-auto w-full max-w-(--breakpoint-2xl) overflow-hidden p-3 sm:p-4 md:p-6 2xl:p-10">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
