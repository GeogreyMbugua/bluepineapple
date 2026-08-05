import { NextRequest } from 'next/server';
import { vesselService } from '@blue-pineapple/iam';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    console.error('[FLEET_SLUG_API] Parsed slug:', decodedSlug);

    const vessels = await vesselService.listActiveVessels();
    console.error('[FLEET_SLUG_API] Active vessels count:', vessels.length);

    const vessel = vessels.find((v) => v.slug && v.slug.toLowerCase() === decodedSlug.toLowerCase());
    console.error('[FLEET_SLUG_API] Match result:', vessel ? vessel.id : 'null');

    if (!vessel) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'Vessel not found' } },
        { status: 404 }
      );
    }

    return Response.json({ data: vessel, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[FLEET_SLUG_API] Full error:', error);
    console.error('[FLEET_SLUG_API] Error stack:', error instanceof Error ? error.stack : 'no stack');
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch vessel' } },
      { status: 500 }
    );
  }
}
