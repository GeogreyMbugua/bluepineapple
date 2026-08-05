import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { partnerService, partnerLifecycleService } from '@blue-pineapple/iam';

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

  const partner = await partnerService.findById(id);
  if (!partner) {
    return Response.json(
      { error: { code: 'NOT_FOUND', message: 'Partner not found' } },
      { status: 404 }
    );
  }

  return Response.json({ data: partner, timestamp: new Date().toISOString() });
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

  const body = await request.json();
  const { companyName, commissionRate, status } = body;

  const updateData: Record<string, unknown> = {};
  if (companyName !== undefined) updateData.companyName = companyName;
  if (commissionRate !== undefined) updateData.commissionRate = commissionRate;
  if (status !== undefined) updateData.status = status;

  const updated = await partnerService.updateProfile(id, updateData);

  return Response.json({ data: updated, timestamp: new Date().toISOString() });
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

  const body = await request.json();
  const { action } = body;

  switch (action) {
    case 'activate':
      await partnerLifecycleService.activatePartner(id, result.id);
      break;
    case 'suspend':
      await partnerLifecycleService.suspendPartner(id, result.id, body.reason);
      break;
    case 'terminate':
      await partnerLifecycleService.terminatePartner(id, result.id, body.reason);
      break;
    default:
      return Response.json(
        { error: { code: 'INVALID_ACTION', message: 'Unknown action' } },
        { status: 400 }
      );
  }

  return Response.json({ data: { success: true }, timestamp: new Date().toISOString() });
}
