import { prisma } from '@blue-pineapple/database';
import type { DashboardActivity, PartnerRow } from '@/components/admin/types';

export interface DashboardKpis {
  totalUsers: number;
  activePartners: number;
  pendingPartners: number;
  todayBookings: number;
  activeDepartures: number;
}

export interface DashboardData {
  kpis: DashboardKpis;
  recentActivity: DashboardActivity[];
}

export interface PartnerStatsRow extends PartnerRow {
  yearlyBookings: number;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export async function getAdminDashboardData(): Promise<DashboardData> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers, activePartners, pendingPartners, activeDepartures, todayBookings, recentBookings] =
      await Promise.all([
        prisma.user.count(),
        prisma.partnerProfile.count({ where: { status: 'ACTIVE' } }),
        prisma.partnerProfile.count({ where: { status: 'PENDING' } }),
        prisma.departure.count({ where: { status: 'SCHEDULED' } }),
        prisma.booking.count({ where: { createdAt: { gte: today } } }),
        prisma.booking.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            partner: { include: { user: true } },
            departure: { include: { experience: true } },
          },
        }),
      ]);

    const recentActivity: DashboardActivity[] = recentBookings.map((booking) => ({
      id: booking.id,
      action: `New booking ${booking.bookingReference}`,
      target: booking.partner?.user?.email ?? booking.partner?.companyName ?? 'Unknown',
      time: formatTimeAgo(booking.createdAt),
    }));

    return {
      kpis: {
        totalUsers,
        activePartners,
        pendingPartners,
        todayBookings,
        activeDepartures,
      },
      recentActivity,
    };
  } catch (error) {
    console.error('[AdminDashboardService] getAdminDashboardData error:', error);
    return {
      kpis: {
        totalUsers: 0,
        activePartners: 0,
        pendingPartners: 0,
        todayBookings: 0,
        activeDepartures: 0,
      },
      recentActivity: [],
    };
  }
}

export async function getAdminPartnerStats(): Promise<PartnerStatsRow[]> {
  try {
    const partners = await prisma.partnerProfile.findMany({
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'COMPLETED'] },
            createdAt: { gte: new Date(new Date().getFullYear(), 0, 1) },
          },
          select: { id: true },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return partners.map((partner) => ({
      id: partner.id,
      partnerCode: partner.partnerCode,
      userId: partner.userId,
      companyName: partner.companyName,
      email: partner.user?.email ?? null,
      contactName: partner.user ? `${partner.user.firstName ?? ''} ${partner.user.lastName ?? ''}`.trim() : null,
      status: partner.status as 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED',
      joinedAt: partner.joinedAt.toISOString(),
      yearlyBookings: partner.bookings.length,
      commissionRate: Number(partner.commissionRate),
    }));
  } catch (error) {
    console.error('[AdminDashboardService] getAdminPartnerStats error:', error);
    return [];
  }
}

export async function getAdminTripCalendar(experienceSlug = 'fort-jesus', startStr?: string, endStr?: string) {
  try {
    const startDate = startStr || new Date().toISOString().split('T')[0];
    const endDate = endStr || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const experience = await prisma.experience.findUnique({
      where: { slug: experienceSlug },
      select: { id: true, name: true },
    });

    const departures = await prisma.departure.findMany({
      where: {
        departureDateTime: {
          gte: new Date(startDate + 'T00:00:00Z'),
          lt: new Date(endDate + 'T23:59:59Z'),
        },
        experienceId: experience?.id,
      },
      include: {
        route: { select: { name: true, code: true, stops: { orderBy: { sequence: 'asc' }, select: { name: true, code: true } } } },
        experience: { select: { name: true, category: true, durationMinutes: true, defaultPrice: true, currency: true } },
        vessel: { select: { name: true, type: true, capacity: true } },
        bookings: {
          where: { status: { not: 'CANCELLED' } },
          include: {
            partner: { include: { user: { select: { email: true, firstName: true, lastName: true } } } },
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
          gte: new Date(startDate + 'T00:00:00Z'),
          lt: new Date(endDate + 'T23:59:59Z'),
        },
      },
      select: { date: true, reason: true },
    });

    const blockedDateSet = new Set(blockedDates.map((b) => b.date.toISOString().split('T')[0] ?? ''));

    const calendar = departures.map((departure) => {
      const totalBooked = departure.bookings.reduce((sum, b) => sum + b.totalGuests, 0);
      const dateStr = departure.departureDateTime.toISOString().split('T')[0] ?? '';
      const timeStr = departure.departureDateTime.toISOString().split('T')[1]?.substring(0, 5) ?? '00:00';
      return {
        id: departure.id,
        date: dateStr,
        time: timeStr,
        experience: departure.experience?.name ?? 'Unknown',
        experienceCategory: departure.experience?.category ?? null,
        durationMinutes: departure.experience?.durationMinutes ?? null,
        defaultPrice: departure.experience?.defaultPrice ? Number(departure.experience.defaultPrice) : null,
        currency: departure.experience?.currency ?? 'KES',
        route: departure.route?.name ?? 'Unknown',
        routeCode: departure.route?.code ?? null,
        stops: departure.route?.stops ?? [],
        vessel: departure.vessel?.name ?? 'Unknown',
        vesselType: departure.vessel?.type ?? null,
        totalCapacity: departure.totalCapacity,
        bookedSeats: totalBooked,
        availableCapacity: departure.availableCapacity,
        status: departure.status,
        bookingCount: departure.bookings.length,
        bookings: departure.bookings.map((b) => ({
          id: b.id,
          reference: b.bookingReference,
          status: b.status,
          paymentStatus: b.paymentStatus,
          totalGuests: b.totalGuests,
          totalAmount: Number(b.totalAmount),
          currency: b.currency,
          source: b.source,
          specialRequests: b.specialRequests,
          createdAt: b.createdAt.toISOString(),
          partner: b.partner ? {
            companyName: b.partner.companyName,
            contact: b.partner.user ? `${b.partner.user.firstName ?? ''} ${b.partner.user.lastName ?? ''}`.trim() : null,
            email: b.partner.user?.email ?? null,
          } : null,
          guest: b.guest ? {
            name: `${b.guest.firstName} ${b.guest.lastName}`,
            email: b.guest.email,
            phone: b.guest.phone,
          } : null,
        })),
      };
    });

    const dateMap = new Map<string, {
      date: string;
      isBlocked: boolean;
      blockedReason?: string;
      departures: typeof calendar;
      totalCapacity: number;
      totalBooked: number;
      totalBookings: number;
    }>();

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
        reason: b.reason ?? undefined,
      })),
    };
  } catch (error) {
    console.error('[AdminDashboardService] getAdminTripCalendar error:', error);
    return { dailySummary: [], departures: [], blockedDates: [] };
  }
}
