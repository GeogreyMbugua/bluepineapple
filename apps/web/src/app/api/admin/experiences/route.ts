import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { experienceService } from '@blue-pineapple/iam';
import { CreateExperienceSchema } from '@blue-pineapple/iam';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const experiences = await experienceService.getActive();
    return Response.json({ data: experiences, timestamp: new Date().toISOString() });
  } catch {
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch experiences' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const body = await request.json();
    const validated = CreateExperienceSchema.parse(body);

    const experience = await experienceService.createExperience(validated);

    return Response.json({ data: experience, timestamp: new Date().toISOString() }, { status: 201 });
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
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create experience' } },
      { status: 500 }
    );
  }
}
