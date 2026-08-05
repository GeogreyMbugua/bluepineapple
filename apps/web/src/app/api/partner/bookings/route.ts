import { NextRequest } from 'next/server';
import { requirePartnerAuth } from '@/lib/api/partner-helpers';
import { bookingService, departureService } from '@blue-pineapple/iam';
import { z } from 'zod';
import type { PartnerBooking } from '@/components/admin/types';

const PartnerBookingSchema = z.object({
  departureDate: z.string().min(1, 'Date is required'),
  departureTime: z.string().optional(),
  pickupStopId: z.string().uuid().optional().nullable(),
  totalGuests: z.number().int().positive().max(20, 'Maximum 20 guests per online booking'),
  totalAmount: z.number().nonnegative('Total amount cannot be negative').optional(),
  guest: z
    .object({
      firstName: z.string().min(1).max(100),
      lastName: z.string().min(1).max(100),
      email: z.string().email().optional().nullable(),
      phone: z.string().min(7).max(20).optional().nullable(),
    })
    .optional(),
  specialRequests: z.string().max(2000).optional().nullable(),
  source: z.enum(['PARTNER', 'DIRECT', 'ADMIN', 'HOTEL', 'CORPORATE']).optional(),
  bookingGuests: z
    .array(
      z.object({
        fullName: z.string().min(1).max(200),
        idNumber: z.string().optional().nullable(),
        phoneNumber: z.string().optional().nullable(),
        isPrimary: z.boolean().default(false),
      })
    )
    .optional(),
});

export async function GET(request: NextRequest) {
  const result = await requirePartnerAuth(request);
  if (result instanceof Response) return result;

  try {
    const user = result;
    const partner = await (await import('@blue-pineapple/iam')).partnerService.findByUserId(user.id);

    if (!partner) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'Partner profile not found' } },
        { status: 404 }
      );
    }

    const bookings = await bookingService.getPartnerBookings(partner.id, 50, 0);

    const mapped: PartnerBooking[] = bookings.map((booking) => ({
      id: booking.id,
      bookingReference: booking.bookingReference,
      experience: booking.departure?.experience?.name ?? 'Unknown',
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      totalAmount: String(booking.totalAmount),
      totalGuests: booking.totalGuests,
      createdAt: booking.createdAt.toISOString(),
    }));

    return Response.json({ data: mapped, timestamp: new Date().toISOString() });
  } catch {
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch bookings' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const result = await requirePartnerAuth(request);
  if (result instanceof Response) return result;

  try {
    const user = result;
    const partner = await (await import('@blue-pineapple/iam')).partnerService.findByUserId(user.id);

    if (!partner) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'Partner profile not found' } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = PartnerBookingSchema.parse(body);

    const dateStr = validated.departureDate;
    const departureDateTime = new Date(`${dateStr}T09:30:00`);

    const defaultRoute = await (await import('@blue-pineapple/iam')).departureService.listActiveRoutes();
    const defaultExperience = await (await import('@blue-pineapple/iam')).departureService.listActiveExperiences();
    const defaultVessel = await (await import('@blue-pineapple/iam')).departureService.listActiveVessels();

    const routeId = defaultRoute[0]?.id;
    const experienceId = defaultExperience[0]?.id;
    const vesselId = defaultVessel[0]?.id;

    if (!routeId || !experienceId || !vesselId) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'No active route, experience, or vessel configured' } },
        { status: 404 }
      );
    }

    const experience = defaultExperience[0];
    const pricePerGuest = Number(experience?.defaultPrice ?? 0);
    const clientTotal = validated.totalAmount;
    const fallbackTotal = pricePerGuest * validated.totalGuests;
    const totalAmount = clientTotal && clientTotal > 0 ? clientTotal : fallbackTotal;

    const departure = await departureService.upsertDepartureForDateTime({
      routeId,
      experienceId,
      vesselId,
      departureDateTime,
      totalCapacity: 35,
    });

    const existingBookings = await (await import('@blue-pineapple/iam')).bookingService.getDepartureBookings(departure.id);
    const onlineBooked = existingBookings
      .filter((b: { source: string; totalGuests: number }) => b.source === 'PARTNER' || b.source === 'ONLINE')
      .reduce((sum: number, b: { totalGuests: number }) => sum + b.totalGuests, 0);

    if (onlineBooked + validated.totalGuests > 20) {
      return Response.json(
        { error: { code: 'CAPACITY_EXCEEDED', message: `Only ${20 - onlineBooked} online seats remaining for this departure. Max 20 online bookings allowed.` } },
        { status: 409 }
      );
    }

    const booking = await bookingService.createBooking({
      departureId: departure.id,
      partnerId: partner.id,
      totalGuests: validated.totalGuests,
      totalAmount,
      guest: validated.guest,
      specialRequests: validated.specialRequests,
      source: validated.source ?? 'PARTNER',
      pickupStopId: validated.pickupStopId ?? null,
      bookingGuests: validated.bookingGuests ?? [],
    });

    return Response.json(
      {
        data: {
          ...booking,
          totalAmount: String(totalAmount),
        },
        timestamp: new Date().toISOString(),
      },
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
