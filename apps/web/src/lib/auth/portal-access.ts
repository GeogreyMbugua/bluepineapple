import { redirect } from 'next/navigation';
import type { AuthUser } from '@blue-pineapple/iam';
import { getServerSession } from '@/lib/auth';
import { getSignInPath, hasPortalRole, type Portal } from '@/lib/auth/portals';

export async function requirePortalSession(portal: Portal): Promise<AuthUser> {
  const session = await getServerSession();

  if (!session.user) {
    redirect(getSignInPath(portal));
  }

  if (!hasPortalRole(session.user.roles, portal)) {
    redirect('/unauthorized');
  }

  return session.user;
}
