import type { LayoutProps } from '@/types/layout';

/**
 * Dashboard Portal Layout.
 *
 * Restricted layout for authenticated users.
 * In later phases, this will render the dashboard sidebar, user profile dropdown, and alerts.
 */
export default function DashboardLayout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-muted/10">
      {/* TODO: Add sidebar navigation */}
      <main className="flex-1 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
