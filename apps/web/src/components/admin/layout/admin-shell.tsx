'use client';

import { Sidebar } from './sidebar';
import { Header } from './header';
import { SidebarProvider } from './sidebar/sidebar-context';
import { ProgressBar } from '@/components/admin/progress-bar';
import { SessionHydrator } from '@/components/auth/session-hydrator';
import type { AuthUser } from '@/features/auth/types';

export function AdminShell({
  user,
  children,
}: {
  readonly user: AuthUser;
  readonly children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <SessionHydrator user={user} />
      <ProgressBar />
      <div className="flex min-h-screen bg-background">
        <Sidebar user={user} />
        <div className="w-full bg-surface-secondary">
          <Header user={user} />
          <main className="isolate mx-auto w-full max-w-(--breakpoint-2xl) overflow-hidden p-3 sm:p-4 md:p-6 2xl:p-10">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
