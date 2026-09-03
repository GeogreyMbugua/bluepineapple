import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { getAdminBookings } from '@/lib/admin/bookings';
import { bookingService, departureService } from '@blue-pineapple/iam';
import { CreateBookingSchema } from '@blue-pineapple/iam';
import { prisma } from '@blue-pineapple/database';
import { calculatePricing, type Stop } from '@/lib/pricing/engine';
import { z } from 'zod';

const FortJesusBookingMetadataSchema = z.object({
  experienceSlug: z.literal('fort-jesus'),
  travelDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid travel date is required'),
  originStopName: z.string().min(1, 'Pickup stop is required'),
  destinationStopName: z.string().min(1, 'Destination stop is required'),
});

export async function POST(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    let bookingPayload = body;

    if (!body.departureId && body.experienceSlug === 'fort-jesus') {
      const metadata = FortJesusBookingMetadataSchema.safeParse(body);
      if (!metadata.success) {
        return Response.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: metadata.error.issues[0]?.message ?? 'Invalid Fort Jesus booking details',
            },
          },
          { status: 400 },
        );
      }

      const departure = await departureService.ensureFortJesusDeparture(metadata.data.travelDate);
      const routeStops = await prisma.routeStop.findMany({
        where: { routeId: departure.routeId },
        select: { id: true, name: true },
      });
      const originStop = routeStops.find((stop) => stop.name === metadata.data.originStopName);
      const destinationStop = routeStops.find(
        (stop) => stop.name === metadata.data.destinationStopName,
      );

      if (!originStop || !destinationStop) {
        return Response.json(
          {
            error: {
              code: 'INVALID_ROUTE',
              message: 'Origin and destination must belong to the Fort Jesus route',
            },
          },
          { status: 400 },
        );
      }

      bookingPayload = {
        ...body,
        departureId: departure.id,
        pickupStopId: originStop.id,
        originStopId: originStop.id,
        destinationStopId: destinationStop.id,
      };
    }

    const parsed = CreateBookingSchema.parse(bookingPayload);
    if (!parsed.partnerId) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: 'A partner is required for admin bookings' } },
        { status: 400 },
      );
    }
    const departure = await prisma.departure.findUnique({
      where: { id: parsed.departureId },
      include: { route: { include: { stops: { orderBy: { sequence: 'asc' } } } } },
    });
    const originId = parsed.originStopId ?? parsed.pickupStopId;
    const origin = departure?.route.stops.find((stop) => stop.id === originId);
    const destination = departure?.route.stops.find((stop) => stop.id === parsed.destinationStopId);
    if (!departure || !origin || !destination) {
      return Response.json(
        { error: { code: 'INVALID_ROUTE', message: 'Origin and destination must belong to the departure route' } },
        { status: 400 },
      );
    }
    const adults = parsed.adults ?? parsed.totalGuests;
    const children = parsed.children ?? 0;
    const infants = parsed.infants ?? 0;
    if (adults + children + infants !== parsed.totalGuests) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Passenger composition must equal total guests' } },
        { status: 400 },
      );
    }
    const pricing = calculatePricing({
      origin: origin.name as Stop,
      destination: destination.name as Stop,
      adults,
      children,
      infants,
      returnTicket: parsed.returnTicket ?? false,
      applyDiscounts: false,
    });
    if (Math.abs(parsed.totalAmount - pricing.total) > 0.01) {
      return Response.json(
        { error: { code: 'PRICE_MISMATCH', message: `Price mismatch. Expected KES ${pricing.total}` } },
        { status: 400 },
      );
    }
    const booking = await bookingService.createBooking(
      {
        ...parsed,
        source: 'ADMIN',
        originStopId: origin.id,
        destinationStopId: destination.id,
        pickupStopId: origin.id,
        adults,
        children,
        infants,
        totalGuests: parsed.totalGuests,
        totalAmount: pricing.total,
        segments: pricing.stopCount,
        discountRate: pricing.discountRate,
        discountAmount: pricing.discountAmount,
        partnerId: parsed.partnerId,
      },
      result.id,
    );
    return Response.json({ data: { ...booking, pricing } }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes('capacity')) {
      return Response.json(
        { error: { code: 'CAPACITY_EXCEEDED', message: error.message } },
        { status: 409 },
      );
    }
    return Response.json(
      { error: { code: 'BOOKING_FAILED', message: error instanceof Error ? error.message : 'Failed to create booking' } },
      { status: 400 },
    );
  }
}

export async function GET(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'ALL';
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const bookings = await getAdminBookings({ status, limit });

    return Response.json({ data: { bookings }, timestamp: new Date().toISOString() });
  } catch {
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch bookings' } },
      { status: 500 }
    );
  }
}
