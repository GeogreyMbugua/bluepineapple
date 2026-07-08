import type { LayoutProps } from '@/types/layout';

/**
 * Admin Portal Layout.
 *
 * Restricted layout for platform administrators.
 * Built to enforce strict RBAC checks. In later phases, this layout will block any
 * requests from non-admin accounts before mounting administrative subcomponents.
 */
export default function AdminLayout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* TODO: Enforce strict RBAC middleware validation */}
      {/* TODO: Add admin-specific sidebar navigation */}
      <main className="flex-1 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
