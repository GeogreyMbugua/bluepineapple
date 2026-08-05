import { NextRequest } from 'next/server';
import { departureService } from '@blue-pineapple/iam';
import { bookingService } from '@blue-pineapple/iam';
import { CreateBookingSchema } from '@blue-pineapple/iam';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const experienceId = searchParams.get('experienceId');
    const routeId = searchParams.get('routeId');
    const date = searchParams.get('date');

    const departures = await departureService.getAvailableDepartures({
      ...(experienceId && { experienceId }),
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
    const body = await request.json();
    const validated = CreateBookingSchema.parse(body);

    const result = await bookingService.createBooking({
      ...validated,
      guest: validated.guest ?? undefined,
      bookingGuests: validated.bookingGuests ?? [],
    });

    return Response.json(
      { data: { ...result, totalAmount: validated.totalAmount.toString() }, timestamp: new Date().toISOString() },
      { status: 201 }
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
