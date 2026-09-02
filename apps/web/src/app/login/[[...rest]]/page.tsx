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

export default async function AdminLoginPage() {
  const sessionUser = await getSessionUser();
  const clerkSession = await auth();
  const clerkUserId = clerkSession.userId;

  if (sessionUser && clerkUserId) {
    if (sessionUser.roles.includes('ADMIN' as never) || sessionUser.roles.includes('SUPER_ADMIN' as never)) {
      redirect('/admin');
    }
    if (sessionUser.roles.includes('PARTNER' as never)) {
      redirect('/partner');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <ClerkLoaded>
        <SignIn
          routing="path"
          path="/login"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/admin"
          appearance={{
            elements: {
              rootBox: 'mx-auto w-full max-w-md',
              card: 'border border-stroke shadow-1',
              socialButtonsBlockButton: 'hidden',
              socialButtonsIconButton: 'hidden',
              dividerRow: 'hidden',
            },
          }}
        />
      </ClerkLoaded>
    </div>
  );
}

