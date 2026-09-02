import { ClerkLoaded, SignUp } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { AccountPending } from '@/components/auth/account-pending';
import { getSignInPath, parsePortal, resolvePortalRedirect } from '@/lib/auth/portals';

type SignUpPageProps = {
  searchParams?: Promise<{ portal?: string }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const portal = parsePortal(params?.portal);
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <ClerkLoaded>
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl={getSignInPath(portal)}
          unsafeMetadata={portal === 'partner' ? { signupPortal: 'partner' } : undefined}
          appearance={{
            elements: {
              rootBox: 'mx-auto w-full max-w-md',
              card: 'border border-stroke shadow-1',
            },
          }}
        />
      </ClerkLoaded>
    </div>
  );
}
