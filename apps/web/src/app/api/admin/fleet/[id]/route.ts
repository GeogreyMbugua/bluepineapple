import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { vesselService } from '@blue-pineapple/iam';
import { UpdateVesselSchema } from '@blue-pineapple/iam';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  const { id } = await params;
  if (!id) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Vessel ID is required' } },
      { status: 400 }
    );
  }

  try {
    const vessel = await vesselService.getVessel(id);
    return Response.json({ data: vessel, timestamp: new Date().toISOString() });
  } catch {
    return Response.json(
      { error: { code: 'NOT_FOUND', message: 'Vessel not found' } },
      { status: 404 }
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
      { error: { code: 'VALIDATION_ERROR', message: 'Vessel ID is required' } },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const validated = UpdateVesselSchema.parse(body);

    const vessel = await vesselService.updateVessel(validated, id);

    return Response.json({ data: vessel, timestamp: new Date().toISOString() });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues?.[0]?.message || error.message || 'Validation failed';
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message } },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      if (error.message.includes('already in use')) {
        return Response.json(
          { error: { code: 'CONFLICT', message: error.message } },
          { status: 409 }
        );
      }
    }
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update vessel' } },
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

  const { id } = await params;
  if (!id) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Vessel ID is required' } },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { action } = body;

  try {
    switch (action) {
      case 'activate':
        await vesselService.activateVessel(id);
        break;
      case 'deactivate':
        await vesselService.deactivateVessel(id);
        break;
      case 'decommission':
        await vesselService.decommissionVessel(id);
        break;
      default:
        return Response.json(
          { error: { code: 'INVALID_ACTION', message: 'Unknown action' } },
          { status: 400 }
        );
    }

    return Response.json({ data: { success: true }, timestamp: new Date().toISOString() });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json(
        { error: { code: 'OPERATION_FAILED', message: error.message } },
        { status: 400 }
      );
    }
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to perform action' } },
      { status: 500 }
    );
  }
}
