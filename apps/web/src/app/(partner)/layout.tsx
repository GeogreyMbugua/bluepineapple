import type { LayoutProps } from '@/types/layout';

/**
 * Partner Portal Layout.
 *
 * Restricted layout for registered experiences & fleet partners.
 * Establishes a tailored dashboard separating user features from B2B partner management workflows.
 */
export default function PartnerLayout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* TODO: Add partner-specific sidebar navigation */}
      <main className="flex-1 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
