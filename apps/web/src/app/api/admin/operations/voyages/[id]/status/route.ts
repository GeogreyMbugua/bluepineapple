import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { voyageService } from '@blue-pineapple/iam';
import { prisma } from '@blue-pineapple/database';
import { z } from 'zod';

const StatusTransitionSchema = z.object({
  status: z.enum([
    'READY',
    'BOARDING',
    'DEPARTED',
    'ARRIVED',
    'COMPLETED',
    'CANCELLED',
    'ABORTED',
  ]),
  reason: z.string().max(500).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const { id } = await params;
    const body = await request.json();
    const validated = StatusTransitionSchema.parse(body);

    const voyage = await voyageService.getVoyage(id);
    if (!voyage) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'Voyage not found' } },
        { status: 404 }
      );
    }

    switch (validated.status) {
      case 'READY':
        await prisma.voyage.update({
          where: { id },
          data: { status: 'READY' },
        });
        break;
      case 'BOARDING':
        await voyageService.startBoarding(id, result.id);
        break;
      case 'DEPARTED':
        await voyageService.departVoyage(id, result.id);
        break;
      case 'ARRIVED':
        await voyageService.arriveVoyage(id, result.id);
        break;
      case 'COMPLETED':
        await voyageService.completeVoyage(id, {}, result.id);
        break;
      case 'CANCELLED':
        await voyageService.cancelVoyage(id, { reason: validated.reason ?? undefined }, result.id);
        break;
      case 'ABORTED':
        await voyageService.abortVoyage(id, result.id);
        break;
    }

    return Response.json({
      data: { id, status: validated.status },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues?.[0]?.message || error.message || 'Validation failed';
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message } },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      return Response.json(
        { error: { code: 'TRANSITION_ERROR', message: error.message } },
        { status: 409 }
      );
    }
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to transition voyage status' } },
      { status: 500 }
    );
  }
}