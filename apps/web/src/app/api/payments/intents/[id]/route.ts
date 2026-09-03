import { NextRequest, NextResponse } from 'next/server';
import { mpesaStkService } from '@blue-pineapple/finance';

/**
 * Poll payment intent status (used by checkout UI after STK Push).
 * Pass ?reconcile=1 to also query Daraja when the async callback was missed.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const reconcile = req.nextUrl.searchParams.get('reconcile') === '1';

  try {
    const status = await mpesaStkService.getIntentStatus(id, { reconcile });

    if (!status) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Payment intent not found' } },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load payment status';
    return NextResponse.json(
      { error: { code: 'STATUS_FAILED', message } },
      { status: 500 },
    );
  }
}
