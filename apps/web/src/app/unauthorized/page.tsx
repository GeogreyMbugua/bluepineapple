import Link from 'next/link';
import { getSignInPath } from '@/lib/auth/portals';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-navy,#0f172a)] text-white px-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-2xl font-bold">
          403
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Access Restricted</h1>
          <p className="text-sm text-zinc-300">
            Your account does not have sufficient permissions to view this portal.
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Link
            href={getSignInPath('partner')}
            className="w-full py-2.5 px-4 rounded-xl bg-[var(--color-cyan,#06b6d4)] text-navy-950 font-medium hover:brightness-110 transition text-sm flex items-center justify-center gap-2"
          >
            Sign in as Partner
          </Link>

          <Link
            href={getSignInPath('admin')}
            className="w-full py-2.5 px-4 rounded-xl border border-white/20 bg-white/5 font-medium hover:bg-white/10 transition text-sm flex items-center justify-center gap-2 text-white"
          >
            Sign in as Admin
          </Link>

          <Link
            href="/"
            className="text-xs text-zinc-400 hover:text-white transition pt-2 block"
          >
            ← Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
