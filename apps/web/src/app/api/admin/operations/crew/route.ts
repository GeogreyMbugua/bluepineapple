import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { crewService } from '@blue-pineapple/iam';
import { CreateCrewMemberSchema } from '@blue-pineapple/iam';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || undefined;
    const crew = await crewService.listActiveByRole(role ?? 'CAPTAIN', 100);

    return Response.json({ data: crew, timestamp: new Date().toISOString() });
  } catch (error) {
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch crew members' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const body = await request.json();
    const validated = CreateCrewMemberSchema.parse(body);

    const crewMember = await crewService.createCrewMember(validated, result.id);

    return Response.json({ data: crewMember, timestamp: new Date().toISOString() }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues?.[0]?.message || error.message || 'Validation failed';
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message } },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        return Response.json(
          { error: { code: 'CONFLICT', message: error.message } },
          { status: 409 }
        );
      }
    }
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create crew member' } },
      { status: 500 }
    );
  }
}