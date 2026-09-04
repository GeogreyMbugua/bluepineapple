import { NextRequest } from 'next/server';
import { departureService } from '@blue-pineapple/iam';
import { prisma } from '@blue-pineapple/database';
import { bookingService } from '@blue-pineapple/iam';
import { CreateBookingSchema } from '@blue-pineapple/iam';
import { initializeIam } from '@/lib/server/iam-init';
import { z } from 'zod';
import { calculatePricing, type Stop } from '@/lib/pricing/engine';
import { isMpesaStkEnabled } from '@/lib/payments/mpesa-flags';

const FortJesusBookingMetadataSchema = z.object({
  experienceSlug: z.literal('fort-jesus'),
  travelDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid travel date is required'),
  originStopName: z.string().min(1, 'Pickup stop is required'),
  destinationStopName: z.string().min(1, 'Destination stop is required'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const experienceId = searchParams.get('experienceId');
    const experienceSlug = searchParams.get('experienceSlug');
    const routeId = searchParams.get('routeId');
    const date = searchParams.get('date');

    let resolvedExperienceId = experienceId;
    if (!resolvedExperienceId && experienceSlug) {
      const experience = await prisma.experience.findUnique({
        where: { slug: experienceSlug },
        select: { id: true },
      });
      resolvedExperienceId = experience?.id ?? null;
    }

    if (experienceSlug && !resolvedExperienceId) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'Experience not found' } },
        { status: 404 },
      );
    }
    if (experienceSlug === "fort-jesus" && date) {
      await departureService.ensureFortJesusDeparture(date);
    }

    const departures = await departureService.getAvailableDepartures({
      ...(resolvedExperienceId && { experienceId: resolvedExperienceId }),
      ...(routeId && { routeId }),
      ...(date && { date }),
    });

    return Response.json({ data: departures, timestamp: new Date().toISOString() });
  } catch {
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch departures' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    initializeIam();
    const body = (await request.json()) as Record<string, unknown>;
    let bookingPayload = body;

    if (!body.departureId && body.experienceSlug === 'fort-jesus') {
      const metadata = FortJesusBookingMetadataSchema.safeParse(body);
      if (!metadata.success) {
        return Response.json(
          { error: { code: 'VALIDATION_ERROR', message: metadata.error.issues[0]?.message ?? 'Invalid Fort Jesus booking details' } },
          { status: 400 },
        );
      }

      const departure = await departureService.ensureFortJesusDeparture(
        metadata.data.travelDate,
      );
      const routeStops = await prisma.routeStop.findMany({
        where: { routeId: departure.routeId },
        select: { id: true, name: true },
      });
      const originStop = routeStops.find(
        (stop) => stop.name === metadata.data.originStopName,
      );
      const destinationStop = routeStops.find(
        (stop) => stop.name === metadata.data.destinationStopName,
      );

      if (!originStop || !destinationStop) {
        return Response.json(
          { error: { code: 'INVALID_ROUTE', message: 'Origin and destination must belong to the Fort Jesus route' } },
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

    const validated = CreateBookingSchema.parse(bookingPayload);
    const source = validated.source ?? "DIRECT";
    if (source !== "DIRECT") {
      return Response.json(
        { error: { code: "INVALID_SOURCE", message: "Use the partner or admin booking workflow for this source" } },
        { status: 400 },
      );
    }
    const directPartner =
      source === "DIRECT"
        ? await prisma.partnerProfile.findUnique({
            where: { partnerCode: "DIRECT" },
            select: { id: true },
          })
        : null;
    const partnerId = directPartner?.id ?? validated.partnerId;

    if (!partnerId) {
      return Response.json(
        { error: { code: "VALIDATION_ERROR", message: "Valid partner ID is required" } },
        { status: 400 },
      );
    }

    const departure = await prisma.departure.findUnique({
      where: { id: validated.departureId },
      include: { route: { include: { stops: { orderBy: { sequence: 'asc' } } } } },
    });
    if (!departure) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'Departure not found' } },
        { status: 404 },
      );
    }

    const adults = validated.adults ?? validated.totalGuests;
    const children = validated.children ?? 0;
    const infants = validated.infants ?? 0;
    if (adults + children + infants !== validated.totalGuests) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Passenger composition must equal total guests' } },
        { status: 400 },
      );
    }

    const originStopId = validated.originStopId ?? validated.pickupStopId;
    const destinationStopId = validated.destinationStopId;
    const originStop = departure.route.stops.find((stop) => stop.id === originStopId);
    const destinationStop = departure.route.stops.find((stop) => stop.id === destinationStopId);
    if (!originStop || !destinationStop) {
      return Response.json(
        { error: { code: 'INVALID_ROUTE', message: 'Origin and destination must belong to the departure route' } },
        { status: 400 },
      );
    }

    let pricing;
    try {
      pricing = calculatePricing({
        origin: originStop.name as Stop,
        destination: destinationStop.name as Stop,
        adults,
        children,
        infants,
        returnTicket: validated.returnTicket ?? false,
        applyDiscounts: source === 'DIRECT',
      });
    } catch (error) {
      return Response.json(
        { error: { code: 'INVALID_ROUTE', message: error instanceof Error ? error.message : 'Invalid journey' } },
        { status: 400 },
      );
    }
    if (Math.abs(validated.totalAmount - pricing.total) > 0.01) {
      return Response.json(
        { error: { code: 'PRICE_MISMATCH', message: `Price mismatch. Expected KES ${pricing.total}, got KES ${validated.totalAmount}` } },
        { status: 400 },
      );
    }

    const result = await bookingService.createBooking({
      ...validated,
      source,
      partnerId,
      originStopId: originStop.id,
      destinationStopId: destinationStop.id,
      segments: pricing.stopCount,
      discountRate: pricing.discountRate,
      discountAmount: pricing.discountAmount,
      guest: validated.guest ?? undefined,
      bookingGuests: validated.bookingGuests ?? [],
    });

    const chargeAmount = Math.round(
      result.reused ? Number(result.totalAmount) : pricing.total,
    );

    let stk: {
      intentId: string;
      intentReference: string;
      paymentId: string;
      paymentReference: string;
      checkoutRequestId: string;
      merchantRequestId: string;
      status: 'PENDING';
      customerMessage?: string;
    } | null = null;
    let stkError: string | null = null;
    const mpesaPhone =
      typeof body.mpesaPhone === 'string'
        ? body.mpesaPhone
        : typeof validated.guest?.phone === 'string'
          ? validated.guest.phone
          : null;

    const shouldInitiateStk =
      isMpesaStkEnabled() &&
      Boolean(mpesaPhone) &&
      body.initiateMpesaStk !== false &&
      source === 'DIRECT';

    if (shouldInitiateStk && mpesaPhone) {
      try {
        const { mpesaStkService } = await import('@blue-pineapple/finance');
        // New idempotency key per attempt so a prior FAILED STK does not block retry.
        const attemptKey = `stk:${result.id}:${chargeAmount}:${Date.now()}`;
        stk = await mpesaStkService.initiate({
          bookingId: result.id,
          amount: chargeAmount,
          currency: 'KES',
          phone: mpesaPhone,
          accountReference: result.bookingReference,
          transactionDesc: 'Booking',
          partnerId: partnerId ?? undefined,
          idempotencyKey: result.reused
            ? attemptKey
            : `stk:${result.id}:${chargeAmount}`,
        });
      } catch (error) {
        stkError = error instanceof Error ? error.message : 'STK Push failed';
        console.error('[bookings] STK initiate failed', error);
      }
    }

    return Response.json(
      {
        data: {
          ...result,
          totalAmount: chargeAmount.toString(),
          pricing,
          reused: result.reused,
          mpesaStkEnabled: isMpesaStkEnabled(),
          ...(stk && { mpesaStk: stk }),
          ...(stkError && { stkError }),
        },
        timestamp: new Date().toISOString(),
      },
      { status: result.reused ? 200 : 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues?.[0]?.message || error.message || 'Validation failed';
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message } },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      if (error.message.toLowerCase().includes("capacity")) {
        return Response.json(
          { error: { code: "CAPACITY_EXCEEDED", message: error.message } },
          { status: 409 },
        );
      }
      return Response.json(
        { error: { code: 'OPERATION_FAILED', message: error.message } },
        { status: 400 }
      );
    }
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create booking' } },
      { status: 500 }
    );
  }
}
