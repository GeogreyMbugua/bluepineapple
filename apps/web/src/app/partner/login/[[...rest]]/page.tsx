import { ClerkLoaded, SignIn } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';

async function getSessionUser() {
  try {
    const session = await getServerSession();
    return session.user;
  } catch {
    return null;
  }
}

export default async function PartnerLoginPage() {
  const sessionUser = await getSessionUser();
  const clerkSession = await auth();
  const clerkUserId = clerkSession.userId;

  if (sessionUser && clerkUserId) {
    if (sessionUser.roles.includes('PARTNER' as never)) {
      redirect('/partner');
    }
    redirect('/unauthorized');
  }

  if (clerkUserId && !sessionUser) {
    redirect('/unauthorized');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <ClerkLoaded>
        <SignIn
          routing="path"
          path="/partner/login"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/partner"
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
