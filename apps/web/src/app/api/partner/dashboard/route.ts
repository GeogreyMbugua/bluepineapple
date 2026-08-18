import { NextRequest, NextResponse } from 'next/server';
import { requirePartnerAuth } from '@/lib/api/partner-helpers';
import { getPartnerDashboardData } from '@/lib/services/partner-dashboard.service';

export async function GET(request: NextRequest) {
  const result = await requirePartnerAuth(request);
  if (result instanceof Response) return result;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;

    const data = await getPartnerDashboardData(result.id, {
      firstName: result.firstName,
      lastName: result.lastName,
    }, status);

    if (!data) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data, timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch dashboard data' } },
      { status: 500 }
    );
  }
}
