import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@blue-pineapple/database';
import { getServerSession } from '@/lib/auth';
import { bookingService } from '@blue-pineapple/iam';
import { departureService } from '@blue-pineapple/iam';
import { calculatePricing, type Stop } from '@/lib/pricing/engine';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      departureDate,
      departureTime,
      pickupStopId,
      totalGuests,
      totalAmount,
      specialRequests,
      source = 'PARTNER',
    } = body;

    if (!departureDate || !departureTime || !pickupStopId || !totalGuests) {
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

    const [defaultRoute, defaultVessel] = await Promise.all([
      departureService.listActiveRoutes(),
      departureService.listActiveVessels(),
    ]);

    const routeId = defaultRoute[0]?.id;

    const existingDeparture = await prisma.departure.findFirst({
      where: { experienceId: experience.id },
      orderBy: { departureDateTime: 'desc' },
      select: { vesselId: true },
    });

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
      select: { name: true },
    });

    const pickupStop = await prisma.routeStop.findUnique({
      where: { id: pickupStopId },
      select: { name: true },
    });

    const origin = (pickupStop?.name ?? routeStops[0]?.name ?? 'Mtwapa Beach') as Stop;
    const destination = 'Fort Jesus';

    const expectedPricing = calculatePricing({
      origin,
      destination,
      adults: totalGuests,
      children: 0,
      infants: 0,
      returnTicket: false,
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
      availableCapacity: 20,
    });

    const onlineBooked = await bookingService.getOnlineBookedGuestCount(departure.id);

    if (onlineBooked + totalGuests > 20) {
      return NextResponse.json(
        {
          error: {
            code: 'CAPACITY_EXCEEDED',
            message: `Only ${20 - onlineBooked} seats remaining for this departure`,
          },
        },
        { status: 409 }
      );
    }

    const partnerProfile = await prisma.partnerProfile.findUnique({
      where: { userId: session.user.id },
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
      source: 'PARTNER',
      specialRequests: specialRequests ?? null,
      pickupStopId,
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

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const partnerProfile = await prisma.partnerProfile.findUnique({
      where: { userId: session.user.id },
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
