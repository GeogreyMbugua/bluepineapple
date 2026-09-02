import { NextRequest } from 'next/server';
import type { AuthUser } from '@blue-pineapple/iam';
import { requirePortalAuth } from '@/lib/api/auth-helpers';

export async function requirePartnerAuth(req: NextRequest): Promise<AuthUser | Response> {
  return requirePortalAuth(req, 'partner', 'Partner access required');
}
