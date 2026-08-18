import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { voyageService } from '@blue-pineapple/iam';
import { UpdateVoyageSchema } from '@blue-pineapple/iam';
import { prisma } from '@blue-pineapple/database';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const { id } = await params;
    const voyage = await voyageService.getVoyage(id);

    if (!voyage) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'Voyage not found' } },
        { status: 404 }
      );
    }

    return Response.json({ data: voyage, timestamp: new Date().toISOString() });
  } catch (error) {
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch voyage' } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const { id } = await params;
    const body = await request.json();
    const validated = UpdateVoyageSchema.parse(body);

    const voyage = await voyageService.getVoyage(id);
    if (!voyage) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'Voyage not found' } },
        { status: 404 }
      );
    }

    const updated = await prisma.voyage.update({
      where: { id },
      data: {
        captainId: validated.captainId ?? voyage.captainId,
        operationalNotes: validated.operationalNotes ?? voyage.operationalNotes,
        weatherSummary: validated.weatherSummary ?? voyage.weatherSummary,
        actualDeparture: validated.actualDeparture ?? voyage.actualDeparture,
        actualArrival: validated.actualArrival ?? voyage.actualArrival,
      },
    });

    return Response.json({ data: updated, timestamp: new Date().toISOString() });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues?.[0]?.message || error.message || 'Validation failed';
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message } },
        { status: 400 }
      );
    }
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update voyage' } },
      { status: 500 }
    );
  }
}