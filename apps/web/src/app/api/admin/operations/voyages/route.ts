import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { voyageService } from '@blue-pineapple/iam';
import { VoyageSearchSchema, CreateVoyageSchema } from '@blue-pineapple/iam';
import { prisma } from '@blue-pineapple/database';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const { searchParams } = new URL(request.url);
    const parsed = VoyageSearchSchema.safeParse({
      status: searchParams.get('status') || undefined,
      vesselId: searchParams.get('vesselId') || undefined,
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20,
    });

    if (!parsed.success) {
      const message = parsed.error.issues?.[0]?.message || 'Invalid query parameters';
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message } },
        { status: 400 }
      );
    }

    const experienceSlug = searchParams.get('experienceSlug') || 'fort-jesus';
    const experience = await prisma.experience.findUnique({
      where: { slug: experienceSlug },
      select: { id: true },
    });

    if (!experience) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: `Experience not found: ${experienceSlug}` } },
        { status: 404 }
      );
    }

    const departures = await prisma.departure.findMany({
      where: {
        experienceId: experience.id,
        departureDateTime: {
          gte: parsed.data.from ? new Date(parsed.data.from) : undefined,
          lt: parsed.data.to ? new Date(parsed.data.to + 'T23:59:59Z') : undefined,
        },
      },
      select: { id: true, departureDateTime: true, vesselId: true, routeId: true, status: true },
      orderBy: { departureDateTime: 'asc' },
      take: parsed.data.limit,
    });

    const voyages = await voyageService.searchVoyages({
      ...parsed.data,
      from: parsed.data.from ? new Date(parsed.data.from) : undefined,
      to: parsed.data.to ? new Date(parsed.data.to + 'T23:59:59Z') : undefined,
    });

    const departureMap = new Map(departures.map((d) => [d.id, d]));

    const enrichedVoyages = voyages.map((voyage) => {
      const departure = departureMap.get(voyage.departureId);
      return {
        ...voyage,
        departureDateTime: departure?.departureDateTime ?? voyage.scheduledDeparture,
        vesselId: departure?.vesselId ?? voyage.vesselId,
        routeId: departure?.routeId ?? voyage.routeId,
        departureStatus: departure?.status ?? null,
      };
    });

    return Response.json({
      data: enrichedVoyages,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues?.[0]?.message || error.message || 'Validation failed';
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message } },
        { status: 400 }
      );
    }
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch voyages' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const body = await request.json();
    const validated = CreateVoyageSchema.parse(body);

    const voyage = await voyageService.createVoyage(validated, result.id);

    return Response.json({ data: voyage, timestamp: new Date().toISOString() }, { status: 201 });
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
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create voyage' } },
      { status: 500 }
    );
  }
}