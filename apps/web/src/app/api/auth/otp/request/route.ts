import { NextRequest } from 'next/server';
import { loginService, RequestOtpSchema } from '@blue-pineapple/iam';
import { ok, fail } from '@/lib/api/route-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[OTP_REQUEST] body:', body);
    const validated = RequestOtpSchema.parse(body);
    console.log('[OTP_REQUEST] validated identifier:', validated.identifier);
    const result = await loginService.requestOtp(validated.identifier);
    console.log('[OTP_REQUEST] success:', result);
    return ok(result);
  } catch (error) {
    console.error('[OTP_REQUEST] error:', error);
    if (error instanceof Error && error.message.includes('Invalid identifier')) {
      return fail('INVALID_IDENTIFIER', 'Invalid identifier', 400);
    }
    return fail('OTP_REQUEST_FAILED', 'Failed to request OTP', 500);
  }
}
