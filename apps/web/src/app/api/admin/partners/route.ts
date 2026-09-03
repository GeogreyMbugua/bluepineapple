import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { getAdminPartnersList } from '@/lib/admin/partners';
import { CreatePartnerSchema, partnerService } from '@blue-pineapple/iam';
import { z } from 'zod';

const PartnerListQuerySchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED']).optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const { searchParams } = new URL(request.url);
    const query = PartnerListQuerySchema.parse(Object.fromEntries(searchParams));
    const data = await getAdminPartnersList(query);

    return Response.json({
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: error.issues[0]?.message ?? 'Invalid query' } },
        { status: 400 },
      );
    }
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch partners' } },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  const admin = result;

  try {
    const body = await request.json();
    const validated = CreatePartnerSchema.parse(body);

    const partnerId = await partnerService.createPartner({
      ...validated,
      actorId: admin.id,
    });

    const partner = await partnerService.findById(partnerId);

    return Response.json({ data: partner, timestamp: new Date().toISOString() }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues?.[0]?.message || error.message || 'Validation failed';
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message } },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      if (error.message.includes('already has a partner profile')) {
        return Response.json(
          { error: { code: 'CONFLICT', message: error.message } },
          { status: 409 }
        );
      }
      if (error.message.includes('Partner code')) {
        return Response.json(
          { error: { code: 'CONFLICT', message: error.message } },
          { status: 409 }
        );
      }
    }
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create partner' } },
      { status: 500 }
    );
  }
}
