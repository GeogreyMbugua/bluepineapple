import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { voyageService } from '@blue-pineapple/iam';
import { GenerateManifestSchema } from '@blue-pineapple/iam';
import { prisma } from '@blue-pineapple/database';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const { id } = await params;
    const voyage = await voyageService.getVoyage(id);

    if (!voyage) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'Voyage not found' } },
        { status: 404 },
      );
    }

    const manifest = await prisma.passengerManifest.findMany({
      where: { voyageId: id },
      select: {
        id: true,
        voyageId: true,
        bookingId: true,
        guestId: true,
        status: true,
        checkInId: true,
        boardingId: true,
        notes: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return Response.json({
      data: manifest,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch manifest' },
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const body = await request.json();
    const validated = GenerateManifestSchema.parse(body);

    const count = await voyageService.generateManifest(
      validated.voyageId,
      result.id,
    );

    return Response.json(
      { data: { passengerCount: count }, timestamp: new Date().toISOString() },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message =
        error.issues?.[0]?.message || error.message || 'Validation failed';
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message } },
        { status: 400 },
      );
    }
    if (error instanceof Error) {
      return Response.json(
        { error: { code: 'ERROR', message: error.message } },
        { status: 409 },
      );
    }
    return Response.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to generate manifest',
        },
      },
      { status: 500 },
    );
  }
}
