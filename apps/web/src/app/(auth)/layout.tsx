import type { LayoutProps } from '@/types/layout';

/**
 * Authentication Layout.
 *
 * Centered container layout specifically styled for auth flows (login, register, reset-password).
 * Establishes a focused, distraction-free environment for users signing in.
 */
export default function AuthLayout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-muted/30">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-md p-8">
        {children}
      </div>
    </div>
  );
}
