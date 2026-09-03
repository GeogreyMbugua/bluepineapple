'use client';

import { ClerkLoaded, SignOutButton, useUser } from '@clerk/nextjs';
import { getSignInPath, type Portal } from '@/lib/auth/portals';

type AccountPendingActionsProps = {
  portal?: Portal;
};

export function AccountPendingActions({ portal }: AccountPendingActionsProps) {
  const { user } = useUser();
  const signInPath = getSignInPath(portal);

  return (
    <ClerkLoaded>
      <div className="flex flex-col gap-2 pt-2">
        {user?.primaryEmailAddress?.emailAddress ? (
          <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-dark-6">
            Signed in as{' '}
            <span className="font-medium text-dark">{user.primaryEmailAddress.emailAddress}</span>
          </p>
        ) : null}

        <SignOutButton redirectUrl={signInPath}>
          <button
            type="button"
            className="inline-flex w-full items-center justify-center rounded-lg bg-cyan-950 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-900"
          >
            Sign out and try again
          </button>
        </SignOutButton>

        <SignOutButton redirectUrl="/">
          <button
            type="button"
            className="inline-flex w-full items-center justify-center px-4 py-2 text-sm text-dark-6 hover:text-dark"
          >
            Sign out and return to homepage
          </button>
        </SignOutButton>
      </div>
    </ClerkLoaded>
  );
}
