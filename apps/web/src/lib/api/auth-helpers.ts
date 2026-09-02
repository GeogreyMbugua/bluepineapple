import { NextRequest, NextResponse } from 'next/server';
import type { AuthUser, Role } from '@blue-pineapple/iam';
import { getServerSession } from '@/lib/auth';
import { hasPortalRole, type Portal } from '@/lib/auth/portals';

export async function requirePortalAuth(
  _req: NextRequest,
  portal: Portal,
  forbiddenMessage: string,
): Promise<AuthUser | Response> {
  try {
    const session = await getServerSession();

    if (!session.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 },
      );
    }

    if (!hasPortalRole(session.user.roles, portal)) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: forbiddenMessage } },
        { status: 403 },
      );
    }

    return session.user;
  } catch {
    return NextResponse.json(
      { error: { code: 'AUTH_FAILED', message: 'Authentication failed' } },
      { status: 401 },
    );
  }
}

export async function requireRolesAuth(
  _req: NextRequest,
  allowedRoles: readonly Role[],
  forbiddenMessage: string,
): Promise<AuthUser | Response> {
  try {
    const session = await getServerSession();

    if (!session.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 },
      );
    }

    const hasRole = session.user.roles.some((role) =>
      (allowedRoles as readonly string[]).includes(role),
    );

    if (!hasRole) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: forbiddenMessage } },
        { status: 403 },
      );
    }

    return session.user;
  } catch {
    return NextResponse.json(
      { error: { code: 'AUTH_FAILED', message: 'Authentication failed' } },
      { status: 401 },
    );
  }
}
