import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { prisma } from '@blue-pineapple/database';

export async function GET(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const [totalUsers, partnerStats, bookingStats, recentBookings, activeDepartures] = await Promise.all([
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
      target: (booking.partner as any)?.user?.email ?? (booking.partner as any)?.companyName ?? 'Unknown',
      time: formatTimeAgo(booking.createdAt),
      status: booking.status,
    }));

    return Response.json({
      data: {
        kpis: {
          totalUsers,
          activePartners: partnerStats,
          pendingPartners: bookingStats,
          todayBookings,
          activeDepartures,
        },
        recentActivity,
      },
      timestamp: new Date().toISOString(),
    });
  } catch {
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch dashboard data' } },
      { status: 500 }
    );
  }
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
