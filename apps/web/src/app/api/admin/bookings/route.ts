import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { bookingService } from '@blue-pineapple/iam';
import { BookingStatus } from '@blue-pineapple/database';
import type { BookingRow } from '@/components/admin/types';
import { CreateBookingSchema } from '@blue-pineapple/iam';
import { prisma } from '@blue-pineapple/database';
import { calculatePricing, type Stop } from '@/lib/pricing/engine';

export async function POST(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const body = CreateBookingSchema.parse(await request.json());
    if (!body.partnerId) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: 'A partner is required for admin bookings' } },
        { status: 400 },
      );
    }
    const departure = await prisma.departure.findUnique({
      where: { id: body.departureId },
      include: { route: { include: { stops: { orderBy: { sequence: 'asc' } } } } },
    });
    const originId = body.originStopId ?? body.pickupStopId;
    const origin = departure?.route.stops.find((stop) => stop.id === originId);
    const destination = departure?.route.stops.find((stop) => stop.id === body.destinationStopId);
    if (!departure || !origin || !destination) {
      return Response.json(
        { error: { code: 'INVALID_ROUTE', message: 'Origin and destination must belong to the departure route' } },
        { status: 400 },
      );
    }
    const adults = body.adults ?? body.totalGuests;
    const children = body.children ?? 0;
    const infants = body.infants ?? 0;
    if (adults + children + infants !== body.totalGuests) {
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
      returnTicket: body.returnTicket ?? false,
      applyDiscounts: false,
    });
    if (Math.abs(body.totalAmount - pricing.total) > 0.01) {
      return Response.json(
        { error: { code: 'PRICE_MISMATCH', message: `Price mismatch. Expected KES ${pricing.total}` } },
        { status: 400 },
      );
    }
    const booking = await bookingService.createBooking(
      {
        ...body,
        source: 'ADMIN',
        originStopId: origin.id,
        destinationStopId: destination.id,
        pickupStopId: origin.id,
        adults,
        children,
        infants,
        totalGuests: body.totalGuests,
        totalAmount: pricing.total,
        segments: pricing.stopCount,
        discountRate: pricing.discountRate,
        discountAmount: pricing.discountAmount,
        partnerId: body.partnerId,
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

    const bookings = await bookingService.searchBookings({ status: status as BookingStatus | string, limit });

    const mapped: BookingRow[] = bookings.map((booking) => ({
      id: booking.id,
      bookingReference: booking.bookingReference,
      experience: booking.departure?.experience?.name ?? 'Unknown',
      partner: booking.partner?.companyName ?? 'Direct',
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      amount: `KES ${Number(booking.totalAmount).toLocaleString()}`,
      date: booking.createdAt.toISOString(),
    }));

    return Response.json({ data: { bookings: mapped }, timestamp: new Date().toISOString() });
  } catch {
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch bookings' } },
      { status: 500 }
    );
  }
}
