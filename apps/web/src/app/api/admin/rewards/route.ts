import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { partnerRewardService } from '@blue-pineapple/iam';

export async function GET(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : undefined;

    const rewards = await partnerRewardService.getAllRewards(year);

    return Response.json({ data: rewards, timestamp: new Date().toISOString() });
  } catch {
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch rewards' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const body = await request.json();
    const { partnerId, year } = body;

    if (!partnerId || !year) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: 'partnerId and year are required' } },
        { status: 400 }
      );
    }

    const voucher = await partnerRewardService.generateVoucher(partnerId, year, result.id);

    return Response.json({ data: voucher, timestamp: new Date().toISOString() }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json(
        { error: { code: 'OPERATION_FAILED', message: error.message } },
        { status: 400 }
      );
    }
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to generate voucher' } },
      { status: 500 }
    );
  }
}
