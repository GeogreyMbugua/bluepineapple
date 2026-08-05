import { vesselService } from '@blue-pineapple/iam';

export async function GET() {
  try {
    const vessels = await vesselService.listActiveVessels();
    return Response.json({ data: vessels, timestamp: new Date().toISOString() });
  } catch {
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch fleet' } },
      { status: 500 }
    );
  }
}
