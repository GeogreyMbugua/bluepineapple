import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { currentUserService } from '@blue-pineapple/iam';

export async function GET(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Email query parameter is required' } },
      { status: 400 }
    );
  }

  const user = await currentUserService.getByEmail(email);

  if (!user) {
    return Response.json(
      { error: { code: 'NOT_FOUND', message: 'User not found' } },
      { status: 404 }
    );
  }

  return Response.json({ data: user, timestamp: new Date().toISOString() });
}
