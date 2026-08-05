import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { prisma } from '@blue-pineapple/database';

export async function GET(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

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

    const partnerStats = partners.map((partner) => ({
      id: partner.id,
      companyName: partner.companyName,
      email: partner.user?.email,
      contactName: partner.user ? `${partner.user.firstName} ${partner.user.lastName}` : null,
      status: partner.status,
      joinedAt: partner.joinedAt,
      yearlyBookings: partner.bookings.length,
      commissionRate: partner.commissionRate,
    }));

    return Response.json({ data: partnerStats, timestamp: new Date().toISOString() });
  } catch {
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch partner stats' } },
      { status: 500 }
    );
  }
}
