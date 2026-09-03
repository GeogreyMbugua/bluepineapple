import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { getAdminPartnerDetail } from '@/lib/admin/partners';
import {
  partnerService,
  partnerLifecycleService,
  UpdatePartnerSchema,
} from '@blue-pineapple/iam';
import { z } from 'zod';

const PartnerActionSchema = z.object({
  action: z.enum(['activate', 'suspend', 'terminate']),
  reason: z.string().trim().max(500).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  const { id } = await params;
  if (!id) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Partner ID is required' } },
      { status: 400 }
    );
  }

  try {
    const data = await getAdminPartnerDetail(id);
    return Response.json({
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Partner not found') {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'Partner not found' } },
        { status: 404 },
      );
    }
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch partner' } },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  const { id } = await params;
  if (!id) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Partner ID is required' } },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const validated = UpdatePartnerSchema.omit({ status: true }).strict().parse(body);
    const updated = await partnerService.updateProfile(id, validated, result.id);

    return Response.json(
      { data: { ...updated, commissionRate: Number(updated.commissionRate) }, timestamp: new Date().toISOString() },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: error.issues[0]?.message ?? 'Invalid partner details' } },
        { status: 400 },
      );
    }
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update partner' } },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  const { id } = await params;
  if (!id) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Partner ID is required' } },
      { status: 400 }
    );
  }

  try {
    const body = PartnerActionSchema.parse(await request.json());

    switch (body.action) {
      case 'activate':
        await partnerLifecycleService.activatePartner(id, result.id);
        break;
      case 'suspend':
        await partnerLifecycleService.suspendPartner(id, result.id, body.reason);
        break;
      case 'terminate':
        await partnerLifecycleService.terminatePartner(id, result.id, body.reason);
        break;
    }

    return Response.json({ data: { success: true }, timestamp: new Date().toISOString() });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: error.issues[0]?.message ?? 'Invalid partner action' } },
        { status: 400 },
      );
    }
    if (error instanceof Error) {
      return Response.json(
        { error: { code: 'OPERATION_FAILED', message: error.message } },
        { status: 400 },
      );
    }
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update partner status' } },
      { status: 500 },
    );
  }
}
