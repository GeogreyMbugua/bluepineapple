import { NextRequest } from 'next/server';
import { requirePartnerAuth } from '@/lib/api/partner-helpers';
import { prisma } from '@blue-pineapple/database';

export async function GET(request: NextRequest) {
  const result = await requirePartnerAuth(request);
  if (result instanceof Response) return result;

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || new Date().toISOString().split('T')[0];
    const endDate = searchParams.get('endDate') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const experience = await prisma.experience.findUnique({
      where: { slug: 'fort-jesus', isActive: true },
      select: { id: true },
    });

    if (!experience) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'Fort Jesus experience not configured' } },
        { status: 404 }
      );
    }

    const departures = await prisma.departure.findMany({
      where: {
        experienceId: experience.id,
        departureDateTime: {
          gte: new Date(startDate + 'T00:00:00Z'),
          lt: new Date(endDate + 'T23:59:59Z'),
        },
      },
      include: {
        route: { select: { name: true, code: true, stops: { orderBy: { sequence: 'asc' }, select: { id: true, name: true, code: true } } } },
        experience: { select: { name: true, category: true, durationMinutes: true, defaultPrice: true, currency: true } },
        vessel: { select: { name: true, type: true, capacity: true } },
      },
      orderBy: { departureDateTime: 'asc' },
    });

    const calendar = departures.map((departure) => ({
      id: departure.id,
      date: departure.departureDateTime.toISOString().split('T')[0] ?? '',
      time: departure.departureDateTime.toISOString().split('T')[1]?.substring(0, 5) ?? '00:00',
      experience: departure.experience?.name ?? 'Unknown',
      experienceCategory: departure.experience?.category ?? null,
      durationMinutes: departure.experience?.durationMinutes ?? null,
      defaultPrice: departure.experience?.defaultPrice ?? null,
      currency: departure.experience?.currency ?? 'KES',
      route: departure.route?.name ?? 'Unknown',
      routeCode: departure.route?.code ?? null,
      stops: departure.route?.stops ?? [],
      vessel: departure.vessel?.name ?? 'Unknown',
      vesselType: departure.vessel?.type ?? null,
      totalCapacity: departure.totalCapacity,
      availableCapacity: departure.availableCapacity,
      status: departure.status,
    }));

    const dateMap = new Map<string, {
      date: string;
      departures: typeof calendar;
    }>();

    for (const dep of calendar) {
      if (!dateMap.has(dep.date)) {
        dateMap.set(dep.date, {
          date: dep.date,
          departures: [],
        });
      }
      const entry = dateMap.get(dep.date)!;
      entry.departures.push(dep);
    }

    const dailySummary = Array.from(dateMap.values()).map((entry) => ({
      ...entry,
      departureCount: entry.departures.length,
    }));

    return Response.json({
      data: {
        dailySummary,
        departures: calendar,
      },
      timestamp: new Date().toISOString(),
    });
  } catch {
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch trip calendar' } },
      { status: 500 }
    );
  }
}
