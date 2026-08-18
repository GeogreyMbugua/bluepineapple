import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { manifestService } from '@blue-pineapple/iam';
import { BoardingSchema, UndoBoardingSchema } from '@blue-pineapple/iam';
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
    const validated = BoardingSchema.parse(body);

    await manifestService.board(manifestId, validated, result.id);

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
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to board passenger' } },
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
    const body = await request.json().catch(() => ({}));
    const validated = UndoBoardingSchema.parse(body);

    await manifestService.undoBoarding(manifestId, validated, result.id);

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
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to undo boarding' } },
      { status: 500 }
    );
  }
}