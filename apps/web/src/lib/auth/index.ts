import { auth } from '@clerk/nextjs/server';
import type { AuthUser } from '@blue-pineapple/iam';
import { AuthorizationError } from '@/services/api/errors';
import { userRepository } from '@blue-pineapple/database';

export interface Session {
  user: AuthUser | null;
  expiresAt: number | null;
}

function flattenUser(dbUser: Awaited<ReturnType<typeof userRepository.findByClerkUserId>>): AuthUser | null {
  if (!dbUser) return null;

  const roles = dbUser.roles.map((ur) => ur.role.name);
  const permissionKeys = Array.from(
    new Set(
      dbUser.roles.flatMap((ur) =>
        ur.role.permissions.map((rp) => rp.permission.key)
      )
    )
  );

  return {
    id: dbUser.id,
    email: dbUser.email ?? null,
    phone: dbUser.phone ?? null,
    firstName: dbUser.firstName ?? null,
    lastName: dbUser.lastName ?? null,
    status: dbUser.status,
    roles: roles as any,
    permissions: permissionKeys as any,
  };
}

export async function getServerSession(): Promise<Session> {
  try {
    const clerkSession = await auth();
    const clerkUserId = clerkSession.userId;

    if (!clerkUserId) {
      return { user: null, expiresAt: null };
    }

    const dbUser = await userRepository.findByClerkUserId(clerkUserId);
    if (!dbUser) {
      return { user: null, expiresAt: null };
    }

    const expiresAt = Date.now() + 3600 * 1000;

    return {
      user: flattenUser(dbUser),
      expiresAt,
    };
  } catch {
    return { user: null, expiresAt: null };
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const { user } = await getServerSession();

  if (!user) {
    throw new AuthorizationError('Authentication required');
  }

  return user;
}

export async function requireRole(role: string): Promise<AuthUser> {
  const user = await requireAuth();

  if (!user.roles.includes(role as never)) {
    throw new AuthorizationError(`Role '${role}' required`);
  }

  return user;
}

export async function requirePermission(permission: string): Promise<AuthUser> {
  const user = await requireAuth();

  if (!user.permissions.includes(permission as never)) {
    throw new AuthorizationError(`Permission '${permission}' required`);
  }

  return user;
}
