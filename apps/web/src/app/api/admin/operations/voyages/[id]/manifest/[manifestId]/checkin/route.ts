import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { prisma } from "@blue-pineapple/database";
import { manifestService } from '@blue-pineapple/iam';
import { CheckInSchema } from '@blue-pineapple/iam';
import { z } from 'zod';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; manifestId: string }> }
) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const { manifestId } = await params;
    const body = await request.json();
    const validated = CheckInSchema.parse(body);

    await manifestService.checkIn(manifestId, validated, result.id);

    return Response.json({ data: { success: true }, timestamp: new Date().toISOString() }, { status: 201 });
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
        { error: { code: 'ERROR', message: error.message } },
        { status: 409 }
      );
    }
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to check in passenger' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; manifestId: string }> }
) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const { manifestId } = await params;

    const manifest = await prisma.passengerManifest.findUnique({
      where: { id: manifestId },
    });

    if (!manifest) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'Manifest entry not found' } },
        { status: 404 }
      );
    }

    if (!manifest.checkInId) {
      return Response.json(
        { error: { code: 'INVALID_STATE', message: 'Passenger has not been checked in' } },
        { status: 409 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.checkIn.delete({ where: { id: manifest.checkInId! } });
      await tx.passengerManifest.update({
        where: { id: manifestId },
        data: { status: 'RESERVED', checkInId: null },
      });
    });

    return Response.json({ data: { success: true }, timestamp: new Date().toISOString() });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json(
        { error: { code: 'ERROR', message: error.message } },
        { status: 409 }
      );
    }
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to undo check-in' } },
      { status: 500 }
    );
  }
}