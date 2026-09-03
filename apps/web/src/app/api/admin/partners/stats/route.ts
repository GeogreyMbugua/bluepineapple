import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { getAdminPartnerStats } from '@/lib/admin/partner-stats';

export async function GET(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const data = await getAdminPartnerStats();
    return Response.json({ data, timestamp: new Date().toISOString() });
  } catch {
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch partner stats' } },
      { status: 500 }
    );
  }
}
