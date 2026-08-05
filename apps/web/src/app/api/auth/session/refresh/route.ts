import { NextRequest } from 'next/server';
import { loginService, RefreshTokenSchema } from '@blue-pineapple/iam';
import { ok, fail, setAccessToken, setRefreshToken } from '@/lib/api/route-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = RefreshTokenSchema.parse(body);
    const result = await loginService.refresh(validated.refreshToken);

    await setAccessToken(result.accessToken, 15 * 60 * 1000);
    await setRefreshToken(result.refreshToken);

    return ok({
      user: result.claims,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });
  } catch {
    return fail('REFRESH_FAILED', 'Invalid or expired refresh token', 401);
  }
}
