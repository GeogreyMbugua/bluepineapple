import { KPICard } from '@/components/admin/kpi-card';
import { CalendarIcon, HandshakeIcon, UserIcon, TrendingUpIcon } from '@/components/admin/icons';
import { FortJesusCalendar } from '@/components/admin/fort-jesus-calendar';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@blue-pineapple/database';
import type { DashboardActivity, PartnerRow } from '@/components/admin/types';

export const dynamic = 'force-dynamic';

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

async function getDashboardData() {
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

    const recentActivity = recentBookings.map((booking) => ({
      id: booking.id,
      action: `New booking ${booking.bookingReference}`,
      target: booking.partner?.user?.email ?? booking.partner?.companyName ?? 'Unknown',
      time: formatTimeAgo(booking.createdAt),
      status: booking.status,
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
    console.error('[AdminDashboard] Failed to fetch dashboard data:', error);
    return { kpis: null, recentActivity: [] };
  }
}

async function getPartnerStats(): Promise<Array<PartnerRow & { yearlyBookings: number }>> {
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
      email: partner.user?.email,
      contactName: partner.user ? `${partner.user.firstName} ${partner.user.lastName}` : null,
      status: partner.status as 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED',
      joinedAt: partner.joinedAt.toISOString(),
      yearlyBookings: partner.bookings.length,
      commissionRate: Number(partner.commissionRate),
    }));
  } catch (error) {
    console.error('[AdminDashboard] Failed to fetch partner stats:', error);
    return [];
  }
}

async function getTripCalendar() {
  try {
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const experience = await prisma.experience.findUnique({
      where: { slug: 'fort-jesus' },
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
            contact: b.partner.user ? `${b.partner.user.firstName} ${b.partner.user.lastName}` : null,
            email: b.partner.user?.email,
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
    console.error('[AdminDashboard] Failed to fetch trip calendar:', error);
    return { dailySummary: [], departures: [], blockedDates: [] };
  }
}

export default async function AdminDashboardPage() {
  const session = await getServerSession();
  if (!session.user) {
    return null;
  }

  const [dashboardData, partnerStats, tripCalendar] = await Promise.all([
    getDashboardData(),
    getPartnerStats(),
    getTripCalendar(),
  ]);

  const kpis = dashboardData?.kpis ?? {
    totalUsers: 0,
    activePartners: 0,
    pendingPartners: 0,
    todayBookings: 0,
    activeDepartures: 0,
  };

  const recentActivity = dashboardData?.recentActivity ?? [];

  const activePartners = partnerStats.filter((p) => p.status === 'ACTIVE');
  const quietPartners = partnerStats.filter((p) => p.yearlyBookings === 0);
  const partnersWithStats = partnerStats as Array<PartnerRow & { yearlyBookings: number }>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark">Dashboard</h1>
        <p className="mt-1 text-dark-6">
          Welcome back, {session.user.firstName ?? session.user.email ?? 'Admin'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Users"
          value={kpis.totalUsers ?? 0}
          icon={<UserIcon className="size-6" />}
          href="/admin/users"
        />
        <KPICard
          title="Active Partners"
          value={kpis.activePartners ?? 0}
          icon={<HandshakeIcon className="size-6" />}
          href="/admin/partners"
        />
        <KPICard
          title="Today's Bookings"
          value={kpis.todayBookings ?? 0}
          icon={<CalendarIcon className="size-6" />}
          href="/admin/bookings"
        />
        <KPICard
          title="Active Departures"
          value={kpis.activeDepartures ?? 0}
          icon={<TrendingUpIcon className="size-6" />}
          href="/admin/operations"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="border border-stroke bg-white shadow-1">
          <div className="border-b border-stroke border-l-[3px] border-l-primary px-6 py-5">
            <h2 className="text-2xl font-bold text-dark">Recent Bookings</h2>
          </div>
          <div className="divide-y divide-stroke">
            {recentActivity.length === 0 ? (
              <div className="px-6 py-8 text-center text-dark-6">No bookings yet</div>
            ) : (
              recentActivity.map((activity: DashboardActivity) => (
                <div key={activity.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-dark">{activity.action}</p>
                    <p className="text-sm text-dark-6">{activity.target}</p>
                  </div>
                  <span className="text-sm text-dark-6">{activity.time}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border border-stroke bg-white shadow-1">
          <div className="border-b border-stroke border-l-[3px] border-l-primary px-6 py-5">
            <h2 className="text-2xl font-bold text-dark">Partner Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-6">Active Partners</span>
                <span className="text-lg font-bold text-dark">{activePartners.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-6">Quiet Partners (0 bookings)</span>
                <span className="text-lg font-bold text-dark">{quietPartners.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-6">Total Partners</span>
                <span className="text-lg font-bold text-dark">{partnerStats.length}</span>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-dark">Top Partners by Bookings</h3>
              <div className="space-y-2">
                {partnersWithStats
                  .sort((a, b) => b.yearlyBookings - a.yearlyBookings)
                  .slice(0, 5)
                  .map((partner) => (
                    <div key={partner.id} className="flex items-center justify-between">
                      <span className="text-sm text-dark">{partner.companyName}</span>
                      <span className="text-sm font-medium text-dark">{partner.yearlyBookings} bookings</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-stroke bg-white shadow-1">
        <div className="border-b border-stroke border-l-[3px] border-l-primary px-6 py-5">
          <h2 className="text-2xl font-bold text-dark">Fort Jesus Calendar</h2>
          <p className="mt-1 text-sm text-dark-6">Select a date to view departures and bookings</p>
        </div>
        <div className="p-4 sm:p-6">
          <FortJesusCalendar data={tripCalendar as any} />
        </div>
      </div>
    </div>
  );
}
