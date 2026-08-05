import { NextRequest } from 'next/server';
import { requirePartnerAuth } from '@/lib/api/partner-helpers';
import { partnerRewardService } from '@blue-pineapple/iam';

export async function GET(request: NextRequest) {
  const result = await requirePartnerAuth(request);
  if (result instanceof Response) return result;

  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()), 10);

    const summary = await partnerRewardService.getPartnerRewardSummary(result.id, year);

    return Response.json({ data: summary, timestamp: new Date().toISOString() });
  } catch {
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch reward summary' } },
      { status: 500 }
    );
  }
}
