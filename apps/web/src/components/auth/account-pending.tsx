import Link from 'next/link';
import { getSignInPath } from '@/lib/auth/portals';

type AccountPendingProps = {
  portal?: 'admin' | 'partner';
};

export function AccountPending({ portal }: AccountPendingProps) {
  const portalLabel = portal === 'admin' ? 'admin' : portal === 'partner' ? 'partner' : 'portal';

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="mx-auto w-full max-w-md space-y-4 rounded-xl border border-stroke bg-white p-8 shadow-1">
        <h1 className="text-xl font-semibold text-dark">Account setup required</h1>
        <p className="text-sm text-dark-6">
          You are signed in with Clerk, but this email is not linked to an active {portalLabel}{' '}
          account in Blue Pineapple yet.
        </p>
        <p className="text-sm text-dark-6">
          Ask an administrator to provision your account first, then sign in again with the same
          email address.
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <Link
            href={getSignInPath(portal)}
            className="inline-flex items-center justify-center rounded-lg bg-cyan-950 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-900"
          >
            Back to sign in
          </Link>
          <Link href="/" className="text-center text-sm text-dark-6 hover:text-dark">
            Return to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
