import { auth, clerkClient } from '@clerk/nextjs/server';
import type { AuthUser, Role, Permission } from '@blue-pineapple/iam';
import { AuthorizationError } from '@/services/api/errors';
import { userRepository } from '@blue-pineapple/database';
import type { Prisma } from '@blue-pineapple/database';
import {
  ensurePartnerProfile,
  ensurePartnerRole,
  isAdminRoleSet,
} from '@/lib/auth/partner-provisioning';

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
    roles: roles as Role[],
    permissions: permissionKeys as Permission[],
  };
}

// Partner provisioning helpers are in @/lib/auth/partner-provisioning

export async function getServerSession(): Promise<Session> {
  try {
    const clerkSession = await auth();
    const clerkUserId = clerkSession.userId;

    if (!clerkUserId) {
      return { user: null, expiresAt: null };
    }

    let dbUser = await userRepository.findByClerkUserId(clerkUserId);

    if (!dbUser) {
      try {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(clerkUserId);
        const primaryEmail = clerkUser.emailAddresses?.find(
          (e) => e.id === clerkUser.primaryEmailAddressId
        )?.emailAddress ?? clerkUser.emailAddresses?.[0]?.emailAddress;

        const firstName = clerkUser.firstName ?? 'Partner';
        const lastName = clerkUser.lastName ?? '';
        const fullName = `${firstName} ${lastName}`.trim();

        if (primaryEmail) {
          const existingUser = await userRepository.findByEmail(primaryEmail);

          if (existingUser) {
            await userRepository.update(existingUser.id, {
              clerkUserId,
              emailVerifiedAt: new Date(),
            } as Prisma.UserUpdateInput);

            // ⛔ Never provision partner resources for admin accounts
            // findByEmail returns plain User (no roles join); re-query with roles to check admin status
            const userWithRoles = await userRepository.findByClerkUserId(clerkUserId);
            const existingRoleNames = userWithRoles?.roles.map((ur) => ur.role.name) ?? [];
            if (!isAdminRoleSet(existingRoleNames)) {
              await ensurePartnerRole(existingUser.id);
              await ensurePartnerProfile(existingUser.id, fullName);
            }

            dbUser = userWithRoles;
          } else {
            const newUser = await userRepository.create({
              email: primaryEmail,
              firstName,
              lastName,
              status: 'ACTIVE',
              clerkUserId,
              emailVerifiedAt: new Date(),
            } as Prisma.UserCreateInput);

            await ensurePartnerRole(newUser.id);
            await ensurePartnerProfile(newUser.id, fullName);
            dbUser = await userRepository.findByClerkUserId(clerkUserId);
          }
        }
      } catch (linkingErr) {
        console.error('Error during auto-linking Clerk user in getServerSession:', linkingErr);
      }
    } else {
      // If user exists and is a PARTNER, ensure partnerProfile exists
      const isPartner = dbUser.roles.some((r) => r.role.name === 'PARTNER');
      if (isPartner && !dbUser.partnerProfile) {
        const fullName = `${dbUser.firstName ?? ''} ${dbUser.lastName ?? ''}`.trim();
        await ensurePartnerProfile(dbUser.id, fullName);
      }
    }

    if (!dbUser) {
      return { user: null, expiresAt: null };
    }

    const expiresAt = Date.now() + 3600 * 1000;

    return {
      user: flattenUser(dbUser),
      expiresAt,
    };
  } catch (error) {
    console.error('Error in getServerSession:', error);
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

