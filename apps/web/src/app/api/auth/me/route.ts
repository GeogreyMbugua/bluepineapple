import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@blue-pineapple/database';
import { ok } from '@/lib/api/route-helpers';

export async function GET() {
  try {
    const clerkSession = await auth();
    const clerkUserId = clerkSession.userId;

    if (!clerkUserId) {
      return ok({ user: null, expiresAt: null });
    }

    const dbUser = await userRepository.findByClerkUserId(clerkUserId);
    if (!dbUser) {
      return ok({ user: null, expiresAt: null });
    }

    const roles = dbUser.roles.map((ur) => ur.role.name);
    const permissions = Array.from(
      new Set(
        dbUser.roles.flatMap((ur) =>
          ur.role.permissions.map((rp) => rp.permission.key)
        )
      )
    );

    return ok({
      id: dbUser.id,
      email: dbUser.email ?? null,
      phone: dbUser.phone ?? null,
      roles,
      permissions,
      expiresAt: Date.now() + 3600 * 1000,
    });
  } catch {
    return ok({ user: null, expiresAt: null });
  }
}
