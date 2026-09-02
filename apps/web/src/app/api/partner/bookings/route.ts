import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@blue-pineapple/database';
import { requirePartnerAuth } from '@/lib/api/partner-helpers';
import { bookingService, departureService } from '@blue-pineapple/iam';
import { initializeIam } from '@/lib/server/iam-init';
import { calculatePricing, type Stop } from '@/lib/pricing/engine';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    initializeIam();
    const authResult = await requirePartnerAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    const body = await request.json();
    const {
      departureDate,
      departureTime,
      pickupStopId,
      originStopId,
      destinationStopId,
      totalGuests,
      adults = totalGuests,
      children = 0,
      infants = 0,
      returnTicket = false,
      totalAmount,
      specialRequests,
    } = body;

    if (!departureDate || !departureTime || (!pickupStopId && !originStopId) || !totalGuests) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    // Fort Jesus water taxi departs at 09:30 EAT daily from Mtwapa Beach
    // EAT is UTC+3, so 09:30 EAT = 06:30 UTC
    const departureDateTime = new Date(`${departureDate}T06:30:00.000Z`);

    const experience = await prisma.experience.findUnique({
      where: { slug: 'fort-jesus', isActive: true },
      select: { id: true },
    });

    if (!experience) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Fort Jesus experience not configured' } },
        { status: 404 }
      );
    }

    const existingDeparture = await prisma.departure.findFirst({
      where: {
        experienceId: experience.id,
        departureDateTime: {
          gte: new Date(`${departureDate}T00:00:00.000Z`),
          lt: new Date(`${departureDate}T23:59:59.999Z`),
        },
      },
      orderBy: { departureDateTime: 'desc' },
      select: { vesselId: true, routeId: true },
    });

    const [defaultRoute, defaultVessel] = await Promise.all([
      departureService.listActiveRoutes(),
      departureService.listActiveVessels(),
    ]);

    const routeId = existingDeparture?.routeId ?? defaultRoute[0]?.id;
    const vesselId = existingDeparture?.vesselId ?? defaultVessel[0]?.id;

    if (!routeId || !vesselId) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'No active route or vessel configured' } },
        { status: 404 }
      );
    }

    const routeStops = await prisma.routeStop.findMany({
      where: { routeId },
      orderBy: { sequence: 'asc' },
      select: { id: true, name: true },
    });

    const originStop = routeStops.find((stop) => stop.id === (originStopId ?? pickupStopId));
    const destinationStop = routeStops.find((stop) => stop.id === destinationStopId) ?? routeStops.at(-1);
    if (!originStop || !destinationStop) {
      return NextResponse.json(
        { error: { code: 'INVALID_ROUTE', message: 'Origin and destination must belong to the route' } },
        { status: 400 }
      );
    }
    const origin = originStop.name as Stop;
    const destination = destinationStop.name as Stop;
    if (adults + children + infants !== totalGuests) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Passenger composition must equal total guests' } },
        { status: 400 }
      );
    }

    const expectedPricing = calculatePricing({
      origin,
      destination,
      adults,
      children,
      infants,
      returnTicket,
      applyDiscounts: false,
    });

    const expectedTotal = expectedPricing.total;
    const clientTotal = Number(totalAmount);

    if (Math.abs(clientTotal - expectedTotal) > 1) {
      return NextResponse.json(
        {
          error: {
            code: 'PRICE_MISMATCH',
            message: `Price mismatch. Expected KES ${expectedTotal}, got KES ${clientTotal}`,
          },
        },
        { status: 400 }
      );
    }

    const departure = await departureService.upsertDepartureForDateTime({
      routeId,
      experienceId: experience.id,
      vesselId,
      departureDateTime,
      totalCapacity: 35,
      onlineCapacity: 20,
      availableCapacity: 35,
    });

    const partnerProfile = await prisma.partnerProfile.findUnique({
      where: { userId: authResult.id },
      select: { id: true, status: true },
    });

    if (!partnerProfile) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Partner profile not found' } },
        { status: 404 }
      );
    }

    const booking = await bookingService.createBooking({
      departureId: departure.id,
      partnerId: partnerProfile.id,
      totalGuests,
      totalAmount: expectedTotal,
      adults,
      children,
      infants,
      returnTicket,
      source: 'PARTNER',
      specialRequests: specialRequests ?? null,
      pickupStopId: originStop.id,
      originStopId: originStop.id,
      destinationStopId: destinationStop.id,
      segments: expectedPricing.stopCount,
      discountRate: expectedPricing.discountRate,
      discountAmount: expectedPricing.discountAmount,
    });

    return NextResponse.json(
      {
        data: {
          bookingReference: booking.bookingReference,
          totalAmount: expectedTotal,
          departureId: departure.id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Partner booking creation error:', error);
    if (error instanceof Error && error.message.toLowerCase().includes('capacity')) {
      return NextResponse.json(
        { error: { code: 'CAPACITY_EXCEEDED', message: error.message } },
        { status: 409 }
      );
    }
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create booking',
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requirePartnerAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    const partnerProfile = await prisma.partnerProfile.findUnique({
      where: { userId: authResult.id },
      select: { id: true },
    });

    if (!partnerProfile) {
      return NextResponse.json({ data: [] });
    }

    const bookings = await bookingService.getPartnerBookings(partnerProfile.id, 50, 0);
    return NextResponse.json({ data: bookings });
  } catch (error) {
    console.error('Partner bookings fetch error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch bookings',
        },
      },
      { status: 500 }
    );
  }
}
