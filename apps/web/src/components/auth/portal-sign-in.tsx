import { ClerkLoaded, SignIn } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { AccountPending } from '@/components/auth/account-pending';
import {
  getPortalHome,
  getSignInPath,
  parsePortal,
  resolvePortalRedirect,
  type Portal,
} from '@/lib/auth/portals';

type PortalSignInProps = {
  portal?: Portal;
};

export async function PortalSignIn({ portal }: PortalSignInProps) {
  const session = await getServerSession();
  const clerkSession = await auth();
  const clerkUserId = clerkSession.userId;

  if (session.user && clerkUserId) {
    const destination = resolvePortalRedirect(session.user.roles);
    if (destination) {
      redirect(destination);
    }
  }

  if (clerkUserId && !session.user) {
    return <AccountPending portal={portal} />;
  }

  const fallbackRedirectUrl = portal ? getPortalHome(portal) : undefined;
  const signUpUrl = portal === 'partner' ? '/sign-up?portal=partner' : '/sign-up';

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <ClerkLoaded>
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl={signUpUrl}
          {...(fallbackRedirectUrl ? { fallbackRedirectUrl } : {})}
          appearance={{
            elements: {
              rootBox: 'mx-auto w-full max-w-md',
              card: 'border border-stroke shadow-1',
              ...(portal === 'admin'
                ? {
                    socialButtonsBlockButton: 'hidden',
                    socialButtonsIconButton: 'hidden',
                    dividerRow: 'hidden',
                  }
                : {}),
            },
          }}
        />
      </ClerkLoaded>
    </div>
  );
}

type PortalSignInPageProps = {
  searchParams?: { portal?: string };
};

export async function PortalSignInPage({ searchParams }: PortalSignInPageProps) {
  const portal = parsePortal(searchParams?.portal);
  return <PortalSignIn portal={portal} />;
}

export function portalSignInRedirect(portal: Portal): never {
  redirect(getSignInPath(portal));
}
