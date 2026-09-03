import { NextRequest, NextResponse } from 'next/server';
import { mpesaStkService } from '@blue-pineapple/finance';

/**
 * Reconcile pending M-Pesa STK payments via Daraja STK Push Query,
 * and retry durable webhook events that failed to apply.
 *
 * Auth: Bearer DARAJA_RECONCILE_SECRET.
 * When DARAJA_ENV=production, the secret is mandatory.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.DARAJA_RECONCILE_SECRET;
  const productionDaraja = process.env.DARAJA_ENV === 'production';

  if (productionDaraja && !secret) {
    return NextResponse.json(
      {
        error: {
          code: 'MISCONFIGURED',
          message: 'DARAJA_RECONCILE_SECRET is required when DARAJA_ENV=production',
        },
      },
      { status: 503 },
    );
  }

  if (secret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Invalid reconcile secret' } },
        { status: 401 },
      );
    }
  }

  try {
    const [stk, webhooks] = await Promise.all([
      mpesaStkService.reconcilePending(),
      mpesaStkService.processRetryableWebhooks(),
    ]);
    return NextResponse.json({
      data: { stk, webhooks },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Reconcile failed';
    return NextResponse.json(
      { error: { code: 'RECONCILE_FAILED', message } },
      { status: 500 },
    );
  }
}
