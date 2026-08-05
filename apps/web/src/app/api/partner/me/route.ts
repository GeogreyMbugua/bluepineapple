import { NextRequest } from 'next/server';
import { requirePartnerAuth } from '@/lib/api/partner-helpers';
import { partnerService } from '@blue-pineapple/iam';
import { z } from 'zod';

const UpdateProfileSchema = z.object({
  companyName: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const result = await requirePartnerAuth(request);
  if (result instanceof Response) return result;

  try {
    const user = result;
    const partner = await partnerService.findByUserId(user.id);

    if (!partner) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'Partner profile not found' } },
        { status: 404 }
      );
    }

    return Response.json({ data: partner, timestamp: new Date().toISOString() });
  } catch {
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch profile' } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const result = await requirePartnerAuth(request);
  if (result instanceof Response) return result;

  try {
    const user = result;
    const partner = await partnerService.findByUserId(user.id);

    if (!partner) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'Partner profile not found' } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = UpdateProfileSchema.parse(body);

    const updated = await partnerService.updateProfile(partner.id, validated);

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
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update profile' } },
      { status: 500 }
    );
  }
}
