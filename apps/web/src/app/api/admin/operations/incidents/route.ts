import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { incidentService } from '@blue-pineapple/iam';
import { CreateIncidentSchema } from '@blue-pineapple/iam';
import { prisma } from '@blue-pineapple/database';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const { searchParams } = new URL(request.url);
    const voyageId = searchParams.get('voyageId') || undefined;
    const severity = searchParams.get('severity') || undefined;

    let incidents;
    if (voyageId) {
      incidents = await incidentService.getVoyageIncidents(voyageId);
    } else if (severity) {
      incidents = await incidentService.getIncidentsBySeverity(severity);
    } else {
      incidents = await prisma.operationalIncident.findMany({
        orderBy: { recordedAt: 'desc' },
        take: 100,
      });
    }

    return Response.json({ data: incidents, timestamp: new Date().toISOString() });
  } catch (error) {
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch incidents' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const body = await request.json();
    const validated = CreateIncidentSchema.parse(body);

    const incident = await incidentService.reportIncident(validated, result.id);

    return Response.json({ data: incident, timestamp: new Date().toISOString() }, { status: 201 });
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
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to report incident' } },
      { status: 500 }
    );
  }
}