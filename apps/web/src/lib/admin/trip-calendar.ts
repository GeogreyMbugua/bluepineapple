import { prisma } from '@blue-pineapple/database';
import { departureService } from '@blue-pineapple/iam';
import type { TripCalendarOptions } from '@/lib/queries/admin/trip-calendar';
import { toPlainDecimalString, toPlainNumber } from '@/lib/admin/serialize';

export type TripCalendarData = Awaited<ReturnType<typeof getAdminTripCalendar>>;

function defaultDateRange() {
  const startDate = new Date().toISOString().split('T')[0]!;
  const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!;
  return { startDate, endDate };
}

export async function getAdminTripCalendar(params: TripCalendarOptions = {}) {
  const { startDate, endDate } =
    params.startStr && params.endStr
      ? { startDate: params.startStr, endDate: params.endStr }
      : defaultDateRange();
  const experienceSlug = params.experienceSlug || 'fort-jesus';

  if (experienceSlug === 'fort-jesus') {
    await departureService.ensureFortJesusDeparture(startDate);
  }

  const experience = await prisma.experience.findUnique({
    where: { slug: experienceSlug },
    select: { id: true, name: true },
  });

  const departures = await prisma.departure.findMany({
    where: {
      departureDateTime: {
        gte: new Date(`${startDate}T00:00:00Z`),
        lt: new Date(`${endDate}T23:59:59Z`),
      },
      experienceId: experience?.id,
    },
    include: {
      route: {
        select: {
          name: true,
          code: true,
          stops: { orderBy: { sequence: 'asc' }, select: { name: true, code: true } },
        },
      },
      experience: {
        select: {
          name: true,
          category: true,
          durationMinutes: true,
          defaultPrice: true,
          currency: true,
        },
      },
      vessel: { select: { name: true, type: true, capacity: true } },
      bookings: {
        where: { status: { in: ['PENDING', 'CONFIRMED'] } },
        include: {
          partner: {
            include: { user: { select: { email: true, firstName: true, lastName: true } } },
          },
          guest: { select: { firstName: true, lastName: true, email: true, phone: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { departureDateTime: 'asc' },
  });

  const blockedDates = await prisma.blockedDate.findMany({
    where: {
      date: {
        gte: new Date(`${startDate}T00:00:00Z`),
        lt: new Date(`${endDate}T23:59:59Z`),
      },
    },
    select: { date: true, reason: true },
  });

  const blockedDateSet = new Set(
    blockedDates.map((b) => b.date.toISOString().split('T')[0] ?? ''),
  );

  const calendar = departures.map((departure) => {
    const totalBooked = departure.bookedSeats;
    const dateStr = departure.departureDateTime.toISOString().split('T')[0] ?? '';
    const timeStr = departure.departureDateTime.toLocaleTimeString('en-US', {
      timeZone: 'Africa/Nairobi',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return {
      id: departure.id,
      date: dateStr,
      time: timeStr,
      experience: departure.experience?.name ?? 'Unknown',
      experienceCategory: departure.experience?.category ?? null,
      durationMinutes: departure.experience?.durationMinutes ?? null,
      defaultPrice: toPlainNumber(departure.experience?.defaultPrice),
      currency: departure.experience?.currency ?? 'KES',
      route: departure.route?.name ?? 'Unknown',
      routeCode: departure.route?.code ?? null,
      stops: departure.route?.stops ?? [],
      vessel: departure.vessel?.name ?? 'Unknown',
      vesselType: departure.vessel?.type ?? null,
      totalCapacity: departure.totalCapacity,
      bookedSeats: totalBooked,
      availableCapacity: departure.availableCapacity,
      onlineCapacity: departure.onlineCapacity,
      onlineBookedSeats: departure.onlineBookedSeats,
      onlineAvailableCapacity: Math.max(0, departure.onlineCapacity - departure.onlineBookedSeats),
      status: departure.status,
      bookingCount: departure.bookings.length,
      bookings: departure.bookings.map((b) => ({
        id: b.id,
        reference: b.bookingReference,
        status: b.status,
        paymentStatus: b.paymentStatus,
        totalGuests: b.totalGuests,
        totalAmount: toPlainDecimalString(b.totalAmount),
        currency: b.currency,
        source: b.source,
        pricingMode: b.pricingMode,
        adults: b.adults,
        children: b.children,
        infants: b.infants,
        specialRequests: b.specialRequests,
        createdAt: b.createdAt.toISOString(),
        partner: b.partner
          ? {
              companyName: b.partner.companyName,
              contact: b.partner.user
                ? `${b.partner.user.firstName} ${b.partner.user.lastName}`
                : null,
              email: b.partner.user?.email ?? null,
            }
          : null,
        guest: b.guest
          ? {
              name: `${b.guest.firstName} ${b.guest.lastName}`,
              email: b.guest.email,
              phone: b.guest.phone,
            }
          : null,
      })),
    };
  });

  const dateMap = new Map<
    string,
    {
      date: string;
      isBlocked: boolean;
      blockedReason?: string;
      departures: typeof calendar;
      totalCapacity: number;
      totalBooked: number;
      totalBookings: number;
    }
  >();

  for (const dep of calendar) {
    if (!dateMap.has(dep.date)) {
      dateMap.set(dep.date, {
        date: dep.date,
        isBlocked: blockedDateSet.has(dep.date),
        departures: [],
        totalCapacity: 0,
        totalBooked: 0,
        totalBookings: 0,
      });
    }
    const entry = dateMap.get(dep.date)!;
    entry.departures.push(dep);
    entry.totalCapacity += dep.totalCapacity;
    entry.totalBooked += dep.bookedSeats;
    entry.totalBookings += dep.bookingCount;
  }

  const dailySummary = Array.from(dateMap.values()).map((entry) => ({
    ...entry,
    departureCount: entry.departures.length,
  }));

  return {
    dailySummary,
    departures: calendar,
    blockedDates: blockedDates.map((b) => ({
      date: b.date.toISOString().split('T')[0] ?? '',
      reason: b.reason,
    })),
  };
}
