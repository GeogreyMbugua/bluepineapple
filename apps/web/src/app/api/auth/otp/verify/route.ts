import { NextRequest } from 'next/server';
import { loginService, VerifyOtpSchema } from '@blue-pineapple/iam';
import { z } from 'zod';
import { ok, fail, setAccessToken, setRefreshToken } from '@/lib/api/route-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = VerifyOtpSchema.parse(body);
    const result = await loginService.verifyOtp(validated.identifier, validated.otpCode, {
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    await setAccessToken(result.accessToken, 15 * 60 * 1000);
    await setRefreshToken(result.refreshToken);

    return ok({
      user: result.claims,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues?.[0]?.message || 'Validation failed';
      return fail('VALIDATION_ERROR', message, 400);
    }
    if (error instanceof Error) {
      if (error.message.includes('Invalid identifier')) {
        return fail('INVALID_IDENTIFIER', 'No account found for this identifier', 401);
      }
      if (error.message.includes('expired') || error.message.includes('Invalid OTP')) {
        return fail('OTP_INVALID', 'Invalid or expired OTP', 401);
      }
    }
    return fail('OTP_VERIFY_FAILED', 'Verification failed', 401);
  }
}
