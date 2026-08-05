import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import type { AuthUser, Role, Permission } from '@blue-pineapple/iam';
import { userRepository } from '@blue-pineapple/database';

export async function requirePartnerAuth(_req: NextRequest): Promise<AuthUser | Response> {
  try {
    const clerkSession = await auth();
    const clerkUserId = clerkSession.userId;

    if (!clerkUserId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const dbUser = await userRepository.findByClerkUserId(clerkUserId);
    if (!dbUser) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'User not found' } },
        { status: 401 }
      );
    }

    const roles = dbUser.roles.map((ur) => ur.role.name);
    const permissionKeys = Array.from(
      new Set(
        dbUser.roles.flatMap((ur) =>
          ur.role.permissions.map((rp) => rp.permission.key)
        )
      )
    );

    const user: AuthUser = {
      id: dbUser.id,
      email: dbUser.email ?? null,
      phone: dbUser.phone ?? null,
      firstName: dbUser.firstName ?? null,
      lastName: dbUser.lastName ?? null,
      status: dbUser.status,
      roles: roles as Role[],
      permissions: permissionKeys as Permission[],
    };

    const hasPartnerRole = user.roles.some((role) => role === 'PARTNER');
    if (!hasPartnerRole) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Partner access required' } },
        { status: 403 }
      );
    }

    return user;
  } catch {
    return NextResponse.json(
      { error: { code: 'AUTH_FAILED', message: 'Authentication failed' } },
      { status: 401 }
    );
  }
}
