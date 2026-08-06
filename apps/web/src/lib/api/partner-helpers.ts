import { NextRequest, NextResponse } from 'next/server';
import type { AuthUser } from '@blue-pineapple/iam';
import { getServerSession } from '@/lib/auth';

export async function requirePartnerAuth(_req: NextRequest): Promise<AuthUser | Response> {
  try {
    const session = await getServerSession();

    if (!session.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const user = session.user;
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

