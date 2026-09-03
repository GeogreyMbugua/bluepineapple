import { prisma } from '@blue-pineapple/database';
import type { DashboardData } from '@/components/admin/types';

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
  const [totalUsers, activePartners, pendingPartners, recentBookings, activeDepartures] =
    await Promise.all([
      prisma.user.count(),
      prisma.partnerProfile.count({ where: { status: 'ACTIVE' } }),
      prisma.partnerProfile.count({ where: { status: 'PENDING' } }),
      prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          partner: { include: { user: true } },
          departure: { include: { experience: true } },
        },
      }),
      prisma.departure.count({ where: { status: 'SCHEDULED' } }),
    ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayBookings = await prisma.booking.count({
    where: { createdAt: { gte: today } },
  });

  const recentActivity = recentBookings.map((booking) => ({
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
      todayRevenue: 0,
      activeSessions: activeDepartures,
    },
    recentActivity,
  };
}
