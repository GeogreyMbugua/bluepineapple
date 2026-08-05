import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { prisma } from '@blue-pineapple/database';

export async function GET(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const vesselId = searchParams.get('vesselId');

    const where: Record<string, unknown> = {};
    if (startDate) {
      where.date = { ...where.date, gte: new Date(startDate + 'T00:00:00Z') };
    }
    if (endDate) {
      where.date = { ...where.date, lte: new Date(endDate + 'T23:59:59Z') };
    }
    if (vesselId) {
      where.vesselId = vesselId;
    }

    const blockedDates = await prisma.blockedDate.findMany({
      where,
      include: {
        vessel: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { date: 'asc' },
    });

    return Response.json({ data: blockedDates, timestamp: new Date().toISOString() });
  } catch {
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch blocked dates' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const body = await request.json();
    const { date, reason, vesselId, isRecurring } = body;

    if (!date || !reason) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Date and reason are required' } },
        { status: 400 }
      );
    }

    const blockedDate = await prisma.blockedDate.create({
      data: {
        date: new Date(date),
        reason,
        vesselId: vesselId || null,
        isRecurring: isRecurring || false,
        blockedBy: result.id,
      },
      include: {
        vessel: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return Response.json({ data: blockedDate, timestamp: new Date().toISOString() }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json(
        { error: { code: 'OPERATION_FAILED', message: error.message } },
        { status: 400 }
      );
    }
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create blocked date' } },
      { status: 500 }
    );
  }
}
