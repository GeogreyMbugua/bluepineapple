import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { prisma } from "@blue-pineapple/database";
import { voyageService } from '@blue-pineapple/iam';
import { AssignCrewSchema, RemoveCrewSchema } from '@blue-pineapple/iam';
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

    const assignments = await prisma.crewAssignment.findMany({
      where: { voyageId: id },
      select: { id: true, voyageId: true, crewMemberId: true, crewRole: true, assignedBy: true, assignedAt: true, notes: true },
      orderBy: { assignedAt: 'asc' },
    });

    return Response.json({ data: assignments, timestamp: new Date().toISOString() });
  } catch (error) {
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch crew assignments' } },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const { id } = await params;
    const body = await request.json();
    const validated = AssignCrewSchema.parse(body);

    await voyageService.assignCrew(id, validated, result.id);

    return Response.json(
      { data: { success: true }, timestamp: new Date().toISOString() },
      { status: 201 }
    );
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
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to assign crew' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const { id } = await params;
    const body = await request.json();
    const validated = RemoveCrewSchema.parse(body);

    await voyageService.removeCrew(id, validated, result.id);

    return Response.json({ data: { success: true }, timestamp: new Date().toISOString() });
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
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to remove crew' } },
      { status: 500 }
    );
  }
}